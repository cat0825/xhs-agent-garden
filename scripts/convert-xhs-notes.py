#!/usr/bin/env python3
"""Convert the archived Obsidian 小红书 notes into craft-garden MDX posts.

Source layout (obsidian-digital-garden):
    <src>/notes/Learning/求职/小红书-AI-Agent/00-索引.md      -> index note (gardenEntry)
    <src>/notes/Learning/求职/小红书-AI-Agent/notes/*.md      -> 42 note files
    <src>/img/Learning/求职/小红书-AI-Agent/assets/xhs-<id>/  -> images

Target layout (craft-garden):
    content/xhs-<id>.mdx
    public/static/xhs/xhs-<id>/<image>

Content is preserved verbatim apart from syntax that MDX/Next cannot render:
  1. the leading H1 (the template renders the title from frontmatter)
  2. bare `#hashtag` lines (MDX would parse them as headings)
  3. Obsidian callouts `> [!info] label` -> <Callout variant label>
  4. markdown images -> <Image> with real intrinsic dimensions (Next requires them)
  5. bare `<` in prose -> &lt;
  6. wikilinks `[[path|alias]]` -> `/posts/<slug>/` links
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import struct
import sys
from dataclasses import dataclass, field
from pathlib import Path

NOTE_SUBDIR = Path("Learning/求职/小红书-AI-Agent")
IMAGE_PREFIX = "/static/xhs"

# Obsidian callout kind -> design-system Callout variant.
CALLOUT_VARIANTS = {
    "info": "info",
    "note": "info",
    "tip": "info",
    "warning": "warning",
    "caution": "warning",
    "danger": "danger",
    "error": "danger",
    "success": "success",
    "quote": "info",
}

# Callout labels longer than this read as prose, not as a label.
MAX_LABEL_LEN = 12

CATEGORY_PREFIXES = ("面经", "学习路线", "岗位要求")


def image_size(path: Path) -> tuple[int, int]:
    """Read intrinsic pixel dimensions from PNG / JPEG / WEBP / GIF headers."""
    data = path.read_bytes()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        width, height = struct.unpack(">II", data[16:24])
        return width, height

    if data[:6] in (b"GIF87a", b"GIF89a"):
        width, height = struct.unpack("<HH", data[6:10])
        return width, height

    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        chunk = data[12:16]
        if chunk == b"VP8X":
            width = int.from_bytes(data[24:27], "little") + 1
            height = int.from_bytes(data[27:30], "little") + 1
            return width, height
        if chunk == b"VP8 ":
            # Frame header: 3-byte tag, 3-byte sync code, then 2x 16-bit sizes.
            width = int.from_bytes(data[26:28], "little") & 0x3FFF
            height = int.from_bytes(data[28:30], "little") & 0x3FFF
            return width, height
        if chunk == b"VP8L":
            bits = int.from_bytes(data[21:25], "little")
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1

    if data[:2] == b"\xff\xd8":
        offset = 2
        while offset < len(data) - 9:
            if data[offset] != 0xFF:
                offset += 1
                continue
            marker = data[offset + 1]
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                offset += 2
                continue
            length = int.from_bytes(data[offset + 2 : offset + 4], "big")
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                height, width = struct.unpack(">HH", data[offset + 5 : offset + 9])
                return width, height
            offset += 2 + length

    raise ValueError(f"unsupported image format: {path}")


def parse_frontmatter(text: str) -> tuple[dict[str, object], str]:
    """Minimal YAML frontmatter reader for the two shapes these notes use."""
    if not text.startswith("---\n"):
        return {}, text

    end = text.index("\n---\n", 3)
    raw, body = text[4:end], text[end + 5 :]

    data: dict[str, object] = {}
    current_list: list[str] | None = None

    for line in raw.splitlines():
        if line.startswith("  - "):
            if current_list is not None:
                current_list.append(line[4:].strip())
            continue

        if ":" not in line:
            continue

        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()

        if not value:
            current_list = []
            data[key] = current_list
        else:
            current_list = None
            data[key] = value.strip('"')

    return data, body


def strip_leading_h1(body: str) -> str:
    return re.sub(r"\A\s*#\s+[^\n]*\n", "", body, count=1)


def escape_hashtag_lines(body: str) -> str:
    """Escape `#tag` at line start so MDX does not read it as a heading.

    Must run before callout conversion (callout bodies also start at col 0 after
    the `> ` strip) and must not touch real `## `/`### ` headings.
    """
    return re.sub(r"^#(?![#\s])", r"\\#", body, flags=re.MULTILINE)


def convert_callouts(body: str) -> str:
    """`> [!kind] label` + following `> ` lines -> <Callout variant label>."""
    lines = body.split("\n")
    out: list[str] = []
    index = 0

    while index < len(lines):
        match = re.match(r"^>\s*\[!(\w+)\]\s*(.*)$", lines[index])
        if not match:
            out.append(lines[index])
            index += 1
            continue

        kind, label = match.group(1).lower(), match.group(2).strip()
        variant = CALLOUT_VARIANTS.get(kind, "info")

        index += 1
        content: list[str] = []
        while index < len(lines) and lines[index].startswith(">"):
            content.append(re.sub(r"^>\s?", "", lines[index]))
            index += 1

        # A long "label" is really the first sentence of the body.
        if len(label) > MAX_LABEL_LEN:
            content.insert(0, label)
            label = ""

        attrs = f'variant="{variant}"'
        if label:
            attrs += f' label="{label}"'

        out.append(f"<Callout {attrs}>")
        out.append("")
        out.extend(content)
        out.append("")
        out.append("</Callout>")
        index += 0

    return "\n".join(out)


def close_truncated_links(body: str) -> str:
    """Repair `[text](https://…` links the original scrape cut off mid-URL.

    All 42 notes carry one of these in their metadata callout; without the
    closing paren markdown renders the raw URL as body text.
    """
    return re.sub(r"\]\((https?://\S*?)[ \t]*$", r"](\1)", body, flags=re.MULTILINE)


def convert_images(body: str, note_id: str, asset_dir: Path) -> tuple[str, list[str]]:
    """`![alt](/img/...)` -> `<Image>` with real dimensions. Returns used files."""
    used: list[str] = []

    def replace(match: re.Match[str]) -> str:
        alt, url = match.group(1), match.group(2)
        name = url.rsplit("/", 1)[-1]
        source = asset_dir / name

        if not source.exists():
            raise FileNotFoundError(f"{note_id}: missing image {source}")

        width, height = image_size(source)
        used.append(name)
        label = alt or name

        return (
            f'<Image src="{IMAGE_PREFIX}/{note_id}/{name}" '
            f'alt="{label}" width={{{width}}} height={{{height}}} />'
        )

    return re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", replace, body), used


def escape_bare_lt(body: str) -> str:
    """Escape `<` that is not the start of a tag, skipping code and JSX."""
    # Split on fenced blocks, inline code, and the JSX we just generated so the
    # escape never lands inside them.
    parts = re.split(r"(```.*?```|`[^`\n]*`|<[A-Za-z/][^>]*>)", body, flags=re.DOTALL)
    for index in range(0, len(parts), 2):
        parts[index] = re.sub(r"<(?![A-Za-z/!])", "&lt;", parts[index])
    return "".join(parts)


def convert_wikilinks(body: str, slug_by_path: dict[str, str]) -> str:
    def replace(match: re.Match[str]) -> str:
        target, _, alias = match.group(1).partition("|")
        slug = slug_by_path.get(target.strip())
        text = (alias or target).strip()
        if not slug:
            return text
        return f"[{text}](/posts/{slug}/)"

    return re.sub(r"\[\[([^\]]+)\]\]", replace, body)


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


@dataclass
class Note:
    note_id: str
    slug: str
    title: str
    tags: list[str]
    category: str
    body: str
    source_path: str
    asset_dir: Path
    images: list[str] = field(default_factory=list)


def collect_notes(notes_dir: Path, assets_root: Path) -> list[Note]:
    notes: list[Note] = []

    for path in sorted((notes_dir / "notes").glob("*.md")):
        text = path.read_text(encoding="utf-8")
        front, body = parse_frontmatter(text)

        permalink = str(front.get("permalink", ""))
        match = re.search(r"xhs-([0-9a-f]+)", permalink)
        if not match:
            raise ValueError(f"{path}: no xhs id in permalink {permalink!r}")

        note_id = f"xhs-{match.group(1)}"
        tags = [tag for tag in front.get("tags", []) if isinstance(tag, str)]
        category = next(
            (prefix for prefix in CATEGORY_PREFIXES if path.stem.startswith(prefix)),
            "其他",
        )

        notes.append(
            Note(
                note_id=note_id,
                slug=note_id,
                title=str(front.get("title", path.stem)),
                tags=tags,
                category=category,
                body=body,
                source_path=f"{NOTE_SUBDIR}/notes/{path.stem}",
                asset_dir=assets_root / note_id,
            )
        )

    return notes


def render(note: Note, date: str, slug_by_path: dict[str, str]) -> str:
    body = strip_leading_h1(note.body)
    body = close_truncated_links(body)
    body = escape_hashtag_lines(body)
    body = convert_callouts(body)
    body, note.images = convert_images(body, note.note_id, note.asset_dir)
    body = escape_bare_lt(body)
    body = convert_wikilinks(body, slug_by_path)

    subtitle = f"{note.category} · 小红书笔记归档"
    keywords = [tag for tag in note.tags if tag not in ("小红书", "gardenEntry")]

    front = [
        "---",
        f"title: {yaml_quote(note.title)}",
        f"subtitle: {yaml_quote(subtitle)}",
        f"slug: {note.slug}",
        f"date: {yaml_quote(date)}",
        f"updated: {yaml_quote(date)}",
        "source: eriri",
        f"categories: [{note.category}]",
        f"keywords: [{', '.join(yaml_quote(k) for k in keywords)}]",
        "---",
        "",
    ]

    return "\n".join(front) + body.strip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", required=True, type=Path, help="archive root")
    parser.add_argument("--out", required=True, type=Path, help="repo root")
    parser.add_argument("--date", default="2026-07-25", help="capture date")
    args = parser.parse_args()

    notes_dir = args.src / "notes" / NOTE_SUBDIR
    assets_root = args.src / "img" / NOTE_SUBDIR / "assets"

    if not notes_dir.is_dir():
        print(f"error: notes dir not found: {notes_dir}", file=sys.stderr)
        return 1

    notes = collect_notes(notes_dir, assets_root)
    slug_by_path = {note.source_path: note.slug for note in notes}

    content_dir = args.out / "content"
    image_dir = args.out / "public" / "static" / "xhs"
    content_dir.mkdir(parents=True, exist_ok=True)
    image_dir.mkdir(parents=True, exist_ok=True)

    total_images = 0
    manifest: list[dict[str, object]] = []

    for note in notes:
        mdx = render(note, args.date, slug_by_path)
        (content_dir / f"{note.slug}.mdx").write_text(mdx, encoding="utf-8")

        if note.images:
            target = image_dir / note.note_id
            target.mkdir(parents=True, exist_ok=True)
            for name in dict.fromkeys(note.images):
                shutil.copy2(note.asset_dir / name, target / name)
                total_images += 1

        manifest.append(
            {
                "slug": note.slug,
                "title": note.title,
                "category": note.category,
                "images": len(dict.fromkeys(note.images)),
            }
        )

    # The index note becomes the homepage list; keep its curated copy for reuse.
    index_note = notes_dir / "00-索引.md"
    if index_note.exists():
        _, index_body = parse_frontmatter(index_note.read_text(encoding="utf-8"))
        index_out = args.out / "content" / "_index-source.md"
        index_out.write_text(
            convert_wikilinks(index_body, slug_by_path), encoding="utf-8"
        )

    (args.out / "content" / "xhs-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    by_category: dict[str, int] = {}
    for entry in manifest:
        key = str(entry["category"])
        by_category[key] = by_category.get(key, 0) + 1

    print(f"notes: {len(notes)}  images: {total_images}")
    for key, count in sorted(by_category.items(), key=lambda item: -item[1]):
        print(f"  {key}: {count}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
