#!/usr/bin/env python3
"""删除小红书表情包贴纸图片及其引用。

判据（两条独立证据互相印证）：
  1. 尺寸：近正方形且边长 <= 240px 的小图（表情包贴纸固定 200x200 / 209x209）
  2. 复用：同一张贴纸跨多篇笔记复用（内容图不会出现这种情况）

源笔记作者在「长图内容（视觉重读）」里已人工标注
「### 图 pNN：表情包贴纸，无面经内容」，与尺寸判据 100% 吻合。

清理三处：
  - public/static/xhs/<id>/pNN.png 文件本身
  - content/xhs-<id>.mdx 里对应的 <Image .../> 行
  - 「### 图 ...：表情包贴纸...」描述行（整行只描述贴纸时才删）

用法：
    python3 scripts/strip-stickers.py --dry-run
    python3 scripts/strip-stickers.py
"""

from __future__ import annotations

import argparse
import re
import struct
import sys
from pathlib import Path

MAX_EDGE = 240
MAX_SKEW = 16

IMAGE_RE = re.compile(
    r'^<Image\s+src="(?P<src>[^"]+)"[^>]*?/>\s*$',
    re.MULTILINE,
)
STICKER_DESC_RE = re.compile(
    r"^### 图 [^\n]*?表情包[^\n]*\n?",
    re.MULTILINE,
)


def png_size(data: bytes) -> tuple[int, int] | None:
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def webp_size(data: bytes) -> tuple[int, int] | None:
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    fmt = data[12:16]
    if fmt == b"VP8X":
        w = int.from_bytes(data[24:27], "little") + 1
        h = int.from_bytes(data[27:30], "little") + 1
        return w, h
    if fmt == b"VP8 ":
        i = data.find(b"\x9d\x01\x2a")
        if i > 0:
            w = int.from_bytes(data[i + 3 : i + 5], "little") & 0x3FFF
            h = int.from_bytes(data[i + 5 : i + 7], "little") & 0x3FFF
            return w, h
        return None
    if fmt == b"VP8L":
        n = int.from_bytes(data[21:25], "little")
        return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
    return None


def jpeg_size(data: bytes) -> tuple[int, int] | None:
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i < len(data) - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            h, w = struct.unpack(">HH", data[i + 5 : i + 9])
            return w, h
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        i += 2 + int.from_bytes(data[i + 2 : i + 4], "big")
    return None


def image_size(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()
    for probe in (png_size, webp_size, jpeg_size):
        size = probe(data)
        if size:
            return size
    return None


def is_sticker(size: tuple[int, int] | None) -> bool:
    if not size:
        return False
    w, h = size
    return max(w, h) <= MAX_EDGE and abs(w - h) <= MAX_SKEW


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="仓库根目录")
    parser.add_argument("--dry-run", action="store_true", help="只报告，不写盘")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    img_root = root / "public/static/xhs"
    content = root / "content"

    if not img_root.is_dir() or not content.is_dir():
        print(f"找不到 {img_root} 或 {content}", file=sys.stderr)
        return 1

    stickers: set[Path] = set()
    for path in sorted(img_root.rglob("*")):
        if path.is_file() and is_sticker(image_size(path)):
            stickers.add(path)

    sticker_srcs = {f"/static/xhs/{p.parent.name}/{p.name}" for p in stickers}

    print(f"表情包文件: {len(stickers)}  (唯一 src: {len(sticker_srcs)})")

    removed_refs = 0
    removed_desc = 0
    touched: list[str] = []

    for mdx in sorted(content.glob("xhs-*.mdx")):
        text = mdx.read_text(encoding="utf-8")
        original = text

        def drop_image(match: re.Match[str]) -> str:
            nonlocal removed_refs
            if match.group("src") in sticker_srcs:
                removed_refs += 1
                return ""
            return match.group(0)

        text = IMAGE_RE.sub(drop_image, text)

        def drop_desc(match: re.Match[str]) -> str:
            nonlocal removed_desc
            removed_desc += 1
            return ""

        text = STICKER_DESC_RE.sub(drop_desc, text)

        # 收敛空行：删除后可能留下 3+ 连续空行
        text = re.sub(r"\n{3,}", "\n\n", text)
        # 「## 图片」整段被删空时移除该小节标题
        text = re.sub(r"\n## 图片\n+(?=## )", "\n", text)
        text = re.sub(r"\n## 图片\n+\Z", "\n", text)

        if text != original:
            touched.append(mdx.name)
            if not args.dry_run:
                mdx.write_text(text, encoding="utf-8")

    print(f"删除 <Image> 引用: {removed_refs}")
    print(f"删除贴纸描述行: {removed_desc}")
    print(f"改动 mdx: {len(touched)}")

    if not args.dry_run:
        for path in sorted(stickers):
            path.unlink()
        # 清理空目录
        for d in sorted(img_root.iterdir()):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()
                print(f"移除空目录: {d.name}")

    print("dry-run，未写盘" if args.dry_run else "已写盘")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
