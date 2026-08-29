#!/usr/bin/env python3
"""雷达采集器：按 radar/sources.toml 从小红书 + X 拉取候选内容。

只做「采集 + 过滤 + 落盘」，不生成笔记、不改 content/。
生成笔记是下一步（人工过一遍候选清单后再决定），这样避免自动化把
垃圾内容直接灌进站点。

全程只读，走 ocsafe（桥体检 + 瞬时故障重试 + 产物完整性校验）。

用法：
    python3 radar/collect.py --dry-run          # 只展开查询，不联网
    python3 radar/collect.py                    # 全量采集
    python3 radar/collect.py --only xiaohongshu # 只跑一个源
    python3 radar/collect.py --limit 5          # 覆盖 limit（调试用）
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import tomllib
from datetime import datetime, timedelta, timezone
from pathlib import Path

OCSAFE = Path.home() / ".agents/bin/ocsafe"
ENV = {**os.environ, "OPENCLI_BROWSER_COMMAND_TIMEOUT": "240"}
CMD_TIMEOUT = 900


def log(msg: str) -> None:
    """诊断一律走 stderr，stdout 留给结构化产物。"""
    print(msg, file=sys.stderr, flush=True)


def run_oc(args: list[str]) -> tuple[int, str, str]:
    try:
        r = subprocess.run(
            [str(OCSAFE), *args],
            capture_output=True,
            text=True,
            env=ENV,
            timeout=CMD_TIMEOUT,
        )
        return r.returncode, r.stdout, r.stderr
    except subprocess.TimeoutExpired:
        return 75, "", f"timeout after {CMD_TIMEOUT}s"


def parse_likes(v) -> int:
    """小红书 likes 可能是 '470' / '1.2万' / int。"""
    if isinstance(v, (int, float)):
        return int(v)
    s = str(v or "").strip()
    if not s:
        return 0
    mult = 1.0
    for suffix, m in (("万", 10000), ("w", 10000), ("k", 1000), ("K", 1000)):
        if s.endswith(suffix):
            s, mult = s[: -len(suffix)], m
            break
    try:
        return int(float(s) * mult)
    except ValueError:
        return 0


def parse_date(v) -> datetime | None:
    s = str(v or "").strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m-%d"):
        try:
            d = datetime.strptime(s, fmt)
            if fmt == "%m-%d":
                d = d.replace(year=datetime.now().year)
            return d.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    # X: "Sat Aug 29 08:02:59 +0000 2026"
    try:
        return datetime.strptime(s, "%a %b %d %H:%M:%S %z %Y")
    except ValueError:
        return None


def hit(text: str, words: list[str]) -> str | None:
    low = text.lower()
    for w in words:
        if w.lower() in low:
            return w
    return None


def load_history(raw_dir: Path, content_dir: Path) -> tuple[set[str], set[str]]:
    """已见过的 note_id / tweet_id，用于跨轮去重。

    两个来源：
      1. 历史采集产物 radar/raw/candidates-*.json
      2. 已生成的笔记 content/xhs-<id>.mdx（站上已有的不再重复采）
    """
    ids: set[str] = set()
    titles: set[str] = set()

    if content_dir.is_dir():
        for f in content_dir.glob("xhs-*.mdx"):
            ids.add(f.stem.removeprefix("xhs-"))

    if raw_dir.is_dir():
        for f in sorted(raw_dir.glob("candidates-*.json")):
            try:
                prev = json.loads(f.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue
            for i in prev.get("items", []):
                nid = i.get("note_id") or i.get("tweet_id")
                if nid:
                    ids.add(str(nid))
                # 同作者同标题视为重复发帖（小红书常态）
                if i.get("source") == "xiaohongshu" and i.get("title"):
                    titles.add(f"{i.get('author')}::{i['title']}")
    return ids, titles


def collect_xhs(cfg: dict, meta: dict, limit: int | None, dry: bool,
                known_ids: set[str], known_titles: set[str]) -> list[dict]:
    sec = cfg.get("xiaohongshu") or {}
    if not sec.get("enabled"):
        log("[xhs] disabled，跳过")
        return []

    lim = str(limit or meta.get("default_limit", 20))
    require = sec.get("require_any") or []
    exclude = sec.get("exclude_words") or []
    min_likes = int(sec.get("min_likes", 0))
    cutoff = datetime.now(timezone.utc) - timedelta(days=int(meta.get("lookback_days", 14)))

    out: list[dict] = []
    seen: set[str] = set(known_ids)
    seen_titles: set[str] = set(known_titles)
    skipped_dup = 0
    for qi, item in enumerate(sec.get("queries") or [], 1):
        q, label = item["q"], item.get("label", "")
        if dry:
            log(f"[xhs] DRY {qi}: search {q!r} --limit {lim}  (label={label})")
            continue

        log(f"[xhs] {qi}/{len(sec['queries'])} search {q!r} ...")
        code, so, se = run_oc(["xiaohongshu", "search", q, "--limit", lim, "-f", "json"])
        if code != 0:
            log(f"[xhs] FAIL exit={code}: {se.strip()[-200:]}")
            out.append({"_error": True, "source": "xiaohongshu", "query": q, "exit": code,
                        "stderr": se.strip()[-500:]})
            continue

        try:
            rows = json.loads(so)
        except json.JSONDecodeError as e:
            log(f"[xhs] 产物不是合法 JSON: {e}")
            out.append({"_error": True, "source": "xiaohongshu", "query": q,
                        "exit": 0, "stderr": f"bad json: {e}"})
            continue

        kept = 0
        for r in rows if isinstance(rows, list) else []:
            url = r.get("url") or ""
            nid = url.split("?")[0].rstrip("/").split("/")[-1]
            if not nid or nid in seen:
                skipped_dup += 1
                continue
            title = r.get("title") or ""
            bad = hit(title, exclude)
            if bad:
                continue
            if require and not hit(title, require):
                continue
            likes = parse_likes(r.get("likes"))
            if likes < min_likes:
                continue
            pub = parse_date(r.get("published_at"))
            if pub and pub < cutoff:
                continue
            # 同作者同标题 = 重复发帖，只留第一条
            tkey = f"{r.get('author')}::{title}"
            if tkey in seen_titles:
                skipped_dup += 1
                continue
            seen.add(nid)
            seen_titles.add(tkey)
            kept += 1
            out.append({
                "source": "xiaohongshu",
                "note_id": nid,
                "label": label,
                "query": q,
                "title": title,
                "author": r.get("author"),
                "likes": likes,
                "published_at": r.get("published_at"),
                "url": url,  # 带 xsec_token，可直接喂 note/comments
            })
        log(f"[xhs]   {len(rows) if isinstance(rows, list) else 0} 条 → 保留 {kept}")
        time.sleep(2)
    if skipped_dup:
        log(f"[xhs] 跳过重复 {skipped_dup} 条（历史已见 / 同作者同标题）")
    return out


def collect_x(cfg: dict, meta: dict, limit: int | None, dry: bool,
              known_ids: set[str]) -> list[dict]:
    sec = cfg.get("x") or {}
    if not sec.get("enabled"):
        log("[x] disabled，跳过")
        return []

    lim = str(limit or meta.get("default_limit", 20))
    exclude = sec.get("exclude_words") or []
    exclude_authors = sec.get("exclude_authors") or []
    min_likes = int(sec.get("min_likes", 0))
    products = sec.get("products") or ["live"]
    tbe = str(sec.get("top_by_engagement", 0))
    cutoff = datetime.now(timezone.utc) - timedelta(days=int(meta.get("lookback_days", 14)))

    out: list[dict] = []
    seen: set[str] = set(known_ids)
    queries = sec.get("queries") or []
    for qi, item in enumerate(queries, 1):
        q, label = item["q"], item.get("label", "")
        for product in products:
            if dry:
                log(f"[x] DRY {qi}: search {q!r} --product {product} --limit {lim}  (label={label})")
                continue

            log(f"[x] {qi}/{len(queries)} [{product}] {q[:60]!r} ...")
            args = ["twitter", "search", q, "--product", product, "--limit", lim, "-f", "json"]
            if tbe and tbe != "0":
                args += ["--top-by-engagement", tbe]
            code, so, se = run_oc(args)
            if code != 0:
                log(f"[x] FAIL exit={code}: {se.strip()[-200:]}")
                out.append({"_error": True, "source": "x", "query": q, "product": product,
                            "exit": code, "stderr": se.strip()[-500:]})
                continue

            try:
                rows = json.loads(so)
            except json.JSONDecodeError as e:
                log(f"[x] 产物不是合法 JSON: {e}")
                out.append({"_error": True, "source": "x", "query": q, "product": product,
                            "exit": 0, "stderr": f"bad json: {e}"})
                continue

            kept = 0
            for r in rows if isinstance(rows, list) else []:
                tid = str(r.get("id") or "")
                if not tid or tid in seen:
                    continue
                author = r.get("author") or ""
                if exclude_authors and hit(author, exclude_authors):
                    continue
                blob = f"{r.get('text') or ''}\n{r.get('bio') or ''}"
                if hit(blob, exclude):
                    continue
                likes = parse_likes(r.get("likes"))
                if likes < min_likes:
                    continue
                pub = parse_date(r.get("created_at"))
                if pub and pub < cutoff:
                    continue
                seen.add(tid)
                kept += 1
                out.append({
                    "source": "x",
                    "tweet_id": tid,
                    "label": label,
                    "query": q,
                    "product": product,
                    "author": r.get("author"),
                    "text": r.get("text"),
                    "likes": likes,
                    "views": r.get("views"),
                    "created_at": r.get("created_at"),
                    "url": r.get("url"),
                    "has_quote": bool(r.get("quoted_tweet")),
                })
            log(f"[x]   {len(rows) if isinstance(rows, list) else 0} 条 → 保留 {kept}")
            time.sleep(2)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="radar/sources.toml")
    ap.add_argument("--only", choices=["xiaohongshu", "x"])
    ap.add_argument("--limit", type=int)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-dedup", action="store_true",
                    help="不做跨轮去重（调试用，会重复采到已有内容）")
    args = ap.parse_args()

    cfg_path = Path(args.config)
    if not cfg_path.is_file():
        log(f"找不到配置 {cfg_path}")
        return 1
    cfg = tomllib.loads(cfg_path.read_text(encoding="utf-8"))
    meta = cfg.get("meta") or {}

    if not args.dry_run and not OCSAFE.is_file():
        log(f"找不到 {OCSAFE}，无法采集")
        return 1

    raw_dir = Path(meta.get("raw_dir", "radar/raw"))
    if args.no_dedup:
        known_ids, known_titles = set(), set()
    else:
        known_ids, known_titles = load_history(raw_dir, Path("content"))
        log(f"历史已见 {len(known_ids)} 个 id / {len(known_titles)} 个标题")

    items: list[dict] = []
    if args.only in (None, "xiaohongshu"):
        items += collect_xhs(cfg, meta, args.limit, args.dry_run, known_ids, known_titles)
    if args.only in (None, "x"):
        items += collect_x(cfg, meta, args.limit, args.dry_run, known_ids)

    if args.dry_run:
        log("dry-run 结束，未联网未落盘")
        return 0

    errors = [i for i in items if i.get("_error")]
    good = [i for i in items if not i.get("_error")]

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    raw_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "collected_at": stamp,
        "lookback_days": meta.get("lookback_days"),
        "counts": {
            "xiaohongshu": sum(1 for i in good if i["source"] == "xiaohongshu"),
            "x": sum(1 for i in good if i["source"] == "x"),
            "errors": len(errors),
        },
        "errors": errors,
        "items": good,
    }
    dest = raw_dir / f"candidates-{stamp}.json"
    dest.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    log("")
    log(f"小红书 {payload['counts']['xiaohongshu']} 条 / X {payload['counts']['x']} 条 / 失败 {len(errors)} 次")
    log(f"落盘: {dest}")
    # stdout 只有产物路径，方便管道消费
    print(dest)
    return 1 if errors and not good else 0


if __name__ == "__main__":
    raise SystemExit(main())
