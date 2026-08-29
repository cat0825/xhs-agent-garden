#!/usr/bin/env python3
"""把采集产物压成可读的候选清单（markdown），供人工挑选要写成笔记的条目。

雷达刻意分成三步，中间留人工卡口：
    collect.py  → 原始候选 JSON（机器采集，只做机械过滤）
    digest.py   → markdown 清单（人看，勾选要留的）        ← 本脚本
    转换器      → content/*.mdx（生成笔记）

不自动写 content/，因为「值得写成笔记」是判断题，机器筛不准；
让机器把 20 条压到 5 条，剩下的由人 30 秒决定，比事后清理垃圾便宜。

用法：
    python3 radar/digest.py                      # 用最新一份采集产物
    python3 radar/digest.py radar/raw/xxx.json   # 指定文件
    python3 radar/digest.py --min-likes 50       # 临时提高门槛
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RAW_DIR = Path("radar/raw")


def latest_raw() -> Path | None:
    if not RAW_DIR.is_dir():
        return None
    files = sorted(RAW_DIR.glob("candidates-*.json"))
    return files[-1] if files else None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path", nargs="?")
    ap.add_argument("--min-likes", type=int, default=0)
    ap.add_argument("-o", "--out", help="写入文件（默认 stdout）")
    args = ap.parse_args()

    src = Path(args.path) if args.path else latest_raw()
    if not src or not src.is_file():
        print("找不到采集产物，先跑 python3 radar/collect.py", file=sys.stderr)
        return 1

    data = json.loads(src.read_text(encoding="utf-8"))
    items = [i for i in data.get("items", []) if i.get("likes", 0) >= args.min_likes]
    errors = data.get("errors", [])

    xhs = [i for i in items if i["source"] == "xiaohongshu"]
    xs = [i for i in items if i["source"] == "x"]

    # 小红书按 label 分组，组内按赞降序 —— 对齐站点的三个分类
    order = ["面经", "学习路线", "岗位要求"]
    grouped: dict[str, list[dict]] = {}
    for i in xhs:
        grouped.setdefault(i.get("label") or "其他", []).append(i)
    for v in grouped.values():
        v.sort(key=lambda x: -x.get("likes", 0))

    L: list[str] = []
    L.append(f"# 雷达候选 · {data.get('collected_at', '?')}")
    L.append("")
    L.append(f"来源文件：`{src}`")
    L.append(f"窗口：最近 {data.get('lookback_days', '?')} 天")
    L.append("")
    L.append(f"小红书 **{len(xhs)}** 条 · X **{len(xs)}** 条 · 采集失败 **{len(errors)}** 次")
    L.append("")
    L.append("勾选要写成笔记的条目，然后把 URL 交给转换流程。")
    L.append("")

    if errors:
        L.append("## ⚠ 采集失败")
        L.append("")
        for e in errors:
            first = (e.get("stderr") or "").strip().splitlines()
            msg = first[0] if first else "?"
            L.append(f"- `{e.get('source')}` exit={e.get('exit')} · {e.get('query', '')[:56]} · {msg[:70]}")
        L.append("")
        L.append("**这批结果不完整**，修好桥后重跑。")
        L.append("")

    L.append("## 小红书（核心源）")
    L.append("")
    if not xhs:
        L.append("_本轮无候选_")
        L.append("")
    for label in order + [k for k in grouped if k not in order]:
        rows = grouped.get(label)
        if not rows:
            continue
        L.append(f"### {label}（{len(rows)}）")
        L.append("")
        for i in rows:
            L.append(f"- [ ] **{i['title']}** · ♥{i['likes']} · {i.get('published_at', '?')} · @{i.get('author', '?')}")
            L.append(f"      <{i['url']}>")
        L.append("")

    L.append("## X（辅助源 · 技术风向，一般不直接成笔记）")
    L.append("")
    if not xs:
        L.append("_本轮无候选_")
        L.append("")
    else:
        for i in sorted(xs, key=lambda x: -x.get("likes", 0)):
            text = (i.get("text") or "").replace("\n", " ")[:150]
            L.append(f"- [ ] ♥{i['likes']} · @{i.get('author', '?')} · [{i.get('label', '')}]")
            L.append(f"      {text}")
            L.append(f"      <{i['url']}>")
        L.append("")

    body = "\n".join(L)
    if args.out:
        Path(args.out).write_text(body, encoding="utf-8")
        print(args.out)
    else:
        print(body)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
