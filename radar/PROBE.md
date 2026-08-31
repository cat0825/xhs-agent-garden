# 雷达信息源实测记录

2026-08-29 实测，opencli v1.8.7 + 扩展 v1.0.23。配置调优的依据都在这里，
改 `sources.toml` 前先看这份，避免重踩。

## 结论先行

| 源     | 定位     | 实测命中率         | 说明                                    |
| ------ | -------- | ------------------ | --------------------------------------- |
| 小红书 | **核心** | 19/19 全部对题     | 中文求职内容密度极高，零广告漏网        |
| X      | **辅助** | 22 条里约 3 条噪音 | 「Agent + 求职」交集稀薄，crypto 噪音重 |

小红书出面经/JD/学习路线，直接能成笔记；X 出技术风向，一般只做背景参考。

## 字段实测

### `xiaohongshu search -f json`

```
rank, author, author_url, likes, title, url, published_at
```

- **`url` 自带 `xsec_token`**，可直接喂 `note` / `comments` / `download`，不需要人肉拼
- `likes` 是**字符串**，可能是 `"470"` 或 `"1.2万"` —— 必须过 `parse_likes()`
- `published_at` 是 `YYYY-MM-DD`，可做增量窗口
- 搜索结果 url 形如 `/search_result/<id>?xsec_token=...`（不是 `/explore/`），一样能用

### `twitter search -f json`

```
id, author, bio, text, created_at, likes, views, url,
has_media, media_urls, media_posters, card, quoted_tweet
```

- `created_at` 是 `Sat Aug 29 08:02:59 +0000 2026` 格式
- `quoted_tweet` 有值时，高赞观点常在引用链上游
- `--product live` 出最新，`top` 出高热；**两路都跑**，实测 live 有时 0 条而 top 有 5 条

## X 噪音三类（这是必须配 exclude 的原因）

第一版查询 `"AI agent" (interview OR hiring OR job)` 返回的**全部是加密货币营销帖**。
收紧后仍有三类漏网，已逐条写进 `sources.toml` 的 `exclude_words` / `exclude_authors`：

1. **crypto agent 经济** —— 作者名常带 `Crypto`，正文谈 token / onchain 经济
   实例：`@woryin_Crypto` ♥7「agents can actually participate in an economy」
2. **收益带货** —— 「make $47,300 in a month」这类 AI 赚钱话术
   实例：`@leopardracer` ♥177（赞数不低，光靠 min_likes 挡不住）
3. **宏观财经推演** —— AI 半导体 / Capex / ARR 泡沫分析，与求职无关
   实例：`@fi56622380` ♥309「AI半导体终局推演2026(III)」

**回放验证**：把收紧后的规则重放到收紧前的 22 条上 → 精准挡掉这 3 条，
命中词分别是 `crypto` / `in a month` / `半导体`，其余 19 条零误伤。

关键教训：**高赞不等于相关**。第 2、3 类赞数都比很多优质技术帖高，
只靠 `min_likes` 反而会把噪音留下、把小众好帖筛掉。

## 小红书重复发帖

同一作者会把同一条内容**隔几天重发**，note_id 不同、标题相同：

```
联想北京AI应用开发实习生招聘 · @不甜也不咸的果仁儿 · 2026-08-28 · ♥27
联想北京AI应用开发实习生招聘 · @不甜也不咸的果仁儿 · 2026-08-24 · ♥12
```

所以去重不能只看 note_id，还要看 `作者::标题`。已实现在 `load_history()`，
同时会读 `content/xhs-*.mdx` —— **站上已发布的 42 篇不会被重复采集**。

## 桥（Chrome 扩展）稳定性

一次全量采集（15 条查询）中途扩展掉线，后 5 条全部 `exit 69`。行为符合预期：

- ocsafe **快停不重试**（skill 里写明重试必然失败，裸调会白烧 104s）
- 失败如实记进产物 JSON 的 `errors[]`，`digest.py` 会在清单顶部标 ⚠ 并提示「本批结果不完整」
- 判据只认 `opencli daemon status` 的 `Extension:` 行；**`opencli doctor` 恒 exit 0，退出码无意义**

恢复：打开装了 OpenCLI 扩展的 Chrome 配置文件（`opencli profile list` 能看到 profile 才算好）。
`opencli daemon restart` 不能代劳 —— Chrome 未打包扩展必须在 `chrome://extensions` 手动加载，
这是 Chrome 的安全限制，命令行做不到。

另一个已知坑（本次未复现，扩展已是 v1.0.23）：opencli 自更新只写
`~/.opencli/extension/opencli-extension/`，而 Chrome 加载的可能是
`~/Applications/opencli/extension` —— 版本错配会表现为「桥显示 connected 但命令随机断连」。

## 时间成本

- `xiaohongshu search --limit 10`：约 15 s/条（含一次瞬时故障重试时 111 s）
- `twitter search --limit 10`：约 20 s/条
- 全量 15 条查询：约 6 分钟

定时任务留足 15 分钟余量。

## 桥掉线规律（2026-08-29 三次稳定复现）

**跑 3-4 条查询后必掉**，之后所有命令 `exit 69`，且敲命令不会自动唤醒：

```
[xhs] 1/7 ... 保留 1      ← 成功
[xhs] 2/7 ... 保留 0      ← 成功
[xhs] 3/7 FAIL exit=1: stale page identity
[xhs] 4/7 FAIL exit=69   ← 之后全挂
```

排查掉的几个方向（都不是原因）：

- **扩展版本错配**：两处 manifest 都是 1.0.23，一致
- **扩展被禁用**：`disable_reasons: []`，没被禁。
  注意 `Secure Preferences` 里 `state` 字段可能缺失（值 `None`），
  用 `v.get('state')==1` 判断会误报成「已禁用」
- **headless Chrome 抢占 profile**：那些 puppeteer 实例用的是独立临时目录
  （`puppeteer_dev_chrome_profile-*`），不碰默认 profile
- **`opencli daemon restart`**：重启 daemon 无效，扩展侧不会自动重连

结论是 **Chrome MV3 service worker 被回收**，只能从 Chrome UI 唤醒：
`chrome://extensions` → OpenCLI 扩展 → 点「重新加载」。
命令行代不了（Chrome 安全限制）。

### 静置不会恢复（2026-08-31 实测推翻早前推断）

早前以为「扩展常在几十秒内自行重连」，实测是错的：

```
掉线后静置  +30s: Extension: disconnected
            +60s: Extension: disconnected
            +90s: Extension: disconnected
```

`opencli daemon restart` 同样无效。**只有 chrome://extensions 点「重新加载」
才能唤醒 service worker**，命令行代不了（Chrome 安全限制）。

所以早期版本里「掉线后轮询等 180s」纯属白等，已删。

### reload 后能撑多久

2026-08-31 reload 后实测：小红书 **7/7 查询全过、零失败**（每条 15 结果，
约 2 分钟）；紧接着跑 X 侧第 1 条即掉线。即单次 reload 大约能撐 **7-8 条查询**。

对策是**分源分批跑**，而不是一次 15 条全上：

```bash
python3 radar/collect.py --only xiaohongshu --limit 15   # 先跑完小红书
# 桥掉了就 reload 一次
python3 radar/collect.py --only x --limit 15             # 再跑 X
```

小红书是核心源，优先跑；X 是辅助源，掉了不影响当轮价值。

### 采集器的应对

1. **开跑前探桥**（`wait_bridge(60)`）：桥不通直接退出并打印修复步骤，
   不白跑 6 分钟
2. **不空等**：`wait_bridge` 已退化为一次探测（静置无用，见上）
3. **确认不可用就快停**：`exit 69` 且等不回来时 `break`，
   失败次数从 13 次降到 2 次

4. **零收获不落盘**：空产物只会污染下轮去重索引，且每次都得手动删

实测效果：桥断时 **3 秒退出**、失败 2 次、不产生空文件。
