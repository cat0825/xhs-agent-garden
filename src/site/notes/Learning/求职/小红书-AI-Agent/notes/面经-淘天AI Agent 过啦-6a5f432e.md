---
title: "淘天AI Agent 过啦"
tags:
  - 小红书
  - AI-Agent
  - 面经
  - 求职
permalink: "/note/xhs-6a5f432e/"
---

# 淘天AI Agent 过啦

> [!info] 元数据
> - **作者**：椿.
> - **分类**：面经
> - **抓取时间**：2026-07-25T06:45:45.212Z
> - **原文**：[打开小红书笔记](https://www.xiaohongshu.com/explore/6a5f432e000000000402adf2
> - **互动**：77 / 128 / 9

## 正文

淘天AI Agent一面刚结束了，面试官追着项目细节问，真的细到头皮发麻 还好配合墨迹都能搞定 没把握的🉑辅助
	
RAG部分
混合检索（BM25+向量）结果怎么融合？在哪一步效果最好？PDF扫描件、OCR表格提取踩过哪些坑？准确率大概多少？每个点都追问你当时的实现和问题。
	
多智能体部分
State管理和Checkpoint怎么落地？多个Agent并行跑怎么避免状态竞争？全局State怎么维护？全是实操细节。
	
MCP工具封装
Choice接口封装成MCP时，入参出参怎么标准化？兼容性问题？还问了MCP出现前大模型调工具的流程，以及MCP的缺点和流式支持。
	
工程细节
主子架构？单次会话token数？用的Qwen版本？子任务失败（抓空数据）怎么重试降级？FastAPI+SSE流式，在LangGraph图状态机里怎么捕获节点结果实时推前端？还问了为什么选LangGraph不选LangChain。
	
感受
没超纲题，但面试官全在测你是不是真干过活，每个追问都往实现和异常处理上引。后面还有两轮，继续复盘项目决策逻辑去。
	
#面经 #淘天一面 #AIagent #RAG #MCP #大模型面试 #互联网大厂实习

#面经 #淘天一面 #AIagent #RAG #MCP #大模型面试 #互联网大厂实习

## 长图内容（视觉重读）

> [!note] 由 AI 视觉重读截图整理，替代原 tesseract OCR 乱码。

### 图 p01：阿里巴巴大楼照片，无面经内容

### 图 p03 / p04：表情包贴纸，无面经内容

## 图片

![p01.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a5f432e/p01.webp)
![p03.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a5f432e/p03.png)
![p04.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a5f432e/p04.png)

## 评论摘录

- **小红薯3FJ4674GV**：有手撕吗
- **ZIP**：日常实习吗
- **小红薯645368D2**：有手撕么？
- **daidai**：好厉害啊
- **daidai**：请教下如何学习agent呀，看开源框架源码吗
- **丢丢阿丢**：有没有手撕leetcode哇姐妹还是vibe coding，我看蚂蚁都在vibe coding了
- **h!liang**：考letcode题吗
- **glorina**：能出下答案吗

## 我的批注

- [ ] 是否对标上海实习主线（Agent 应用/全栈）
- [ ] 可迁移到简历/项目的点：
- [ ] 待补学：
