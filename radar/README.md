# 雷达

从小红书 + X 采集 AI Agent 求职情报，产出候选清单供人工挑选。

## 设计原则

**采集和发布之间留人工卡口。** 机器负责把几百条压到十几条，
「值得写成笔记」这个判断留给人 —— 这是判断题，机器筛不准，
事后从站点清理垃圾比事前多点一下贵得多。

```
sources.toml          配置：采什么、从哪采、怎么筛
    ↓ collect.py      机械采集 + 过滤 + 跨轮去重 → radar/raw/candidates-*.json
    ↓ digest.py       压成 markdown 清单
  【人工勾选】         ← 卡口在这里
    ↓ 转换器          convert-xhs-notes.py → content/*.mdx
    ↓ git push        CF auto-deploy → takina.xyz
```

## 用法

```bash
# 看查询怎么展开，不联网
python3 radar/collect.py --dry-run

# 推荐：分源跑。单次扩展 reload 大约只撑 7-8 条查询（见 PROBE.md），
# 小红书是核心源先跑完；桥掉了就去 chrome://extensions 点「重新加载」再跑 X
python3 radar/collect.py --only xiaohongshu --limit 15
python3 radar/collect.py --only x --limit 15

# 一次全采（15 条查询约 6 分钟，桥大概率中途掉线）
python3 radar/collect.py

# 出候选清单
python3 radar/digest.py                    # 最新一份
python3 radar/digest.py --all              # 合并所有轮次并按 id 去重
python3 radar/digest.py --min-likes 50     # 临时提高门槛
python3 radar/digest.py -o /tmp/today.md   # 写文件
```

## 前置条件

采集依赖 opencli 浏览器桥，**必须先确认扩展已连接**：

```bash
opencli daemon status | grep -i extension    # 要求 "Extension: connected"
```

`disconnected` 时不要重试（必然失败）—— 打开装了 OpenCLI 扩展的 Chrome 配置文件即可。
注意 `opencli doctor` 恒 exit 0，**退出码不能当判据**。

## 配置要点

改 `sources.toml` 前先读 `PROBE.md`，那里有实测数据。几条关键的：

- **X 必须配 `exclude_words`**，否则「AI agent + job」会被 crypto 营销帖灌满
- **不能只靠 `min_likes` 筛质量** —— 实测噪音帖赞数（♥177、♥309）比很多优质技术帖高
- **`lookback_days`** 控制增量窗口，避免反复采到老帖
- 去重同时看 `note_id` 和 `作者::标题`（小红书重复发帖是常态），
  并且会读 `content/xhs-*.mdx`，站上已发布的不再采

## 失败处理

采集失败会记进产物 JSON 的 `errors[]`，`digest.py` 在清单顶部标 ⚠ 并提示结果不完整。
**不静默跳过** —— 半批数据当成全量用会让人误判「这周没什么新内容」。

最常见的失败是 `exit 69`（Chrome 扩展桥断）。判据只认 `opencli daemon status`
的 `Extension:` 行（`opencli doctor` 恒 exit 0，退出码不可信）。
桥断后**静置和 `daemon restart` 都无效**，只能 Chrome →
`chrome://extensions` → OpenCLI 扩展 → 点「重新加载」。采集器会在开跑前探桥、
断开时立即停（3 秒退出）并打印这条修复提示，且**零收获不落盘**，
避免空产物污染下轮去重索引。

## 现状

采集层已实测跑通三轮，累计 **40 条小红书 + 22 条 X** 候选，
最近一轮小红书 7/7 查询零失败。**定时调度尚未接** ——
先用手动跑几轮把查询和阈值调稳，再上 launchd，避免定时任务天天灌垃圾。
调度必须带失败上报，否则桥断了会静默产出空清单。
