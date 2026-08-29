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
