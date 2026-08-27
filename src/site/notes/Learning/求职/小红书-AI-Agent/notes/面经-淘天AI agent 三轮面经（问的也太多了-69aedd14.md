---
title: "淘天AI agent 三轮面经（问的也太多了"
tags:
  - 小红书
  - AI-Agent
  - 面经
  - 求职
permalink: "/note/xhs-69aedd14/"
---

# 淘天AI agent 三轮面经（问的也太多了

> [!info] 元数据
> - **作者**：不会agent后端不是好后端
> - **分类**：面经
> - **抓取时间**：2026-07-25T06:45:24.109Z
> - **原文**：[打开小红书笔记](https://www.xiaohongshu.com/explore/69aedd14000000001a035aad
> - **互动**：1737 / 3714 / 64

## 正文

信息量很大的淘天ai应用开发面经，太难面了
	
淘天AI agent 三轮面经（问的也太多了
一面
1. 什么是 AI Agent？与传统 LLM API 调用有什么本质区别？
2. Agent architecture 中 perception-planning-action 的流程是什么？
3. 为什么很多 Agent 框架需要 Tool use？
4. Agent 与 Workflow automation 的区别是什么？
5. 什么是 Agent 的 **goal-driven execution**？
6. Agent 与 RPA有什么差别？
7. 为什么 Agent 比普通 chatbot 更复杂？
8. Agent 的 autonomy 如何定义？
9. Agent 为什么需要 memory？
10. Agent 的 long-term memory 与 short-term memory 如何设计？
11. 什么是 agent loop (think-act-observe)？
12. Agent 为什么容易出现 hallucination？
13. 设计一个 AI Agent 的完整系统架构。
14. Agent planner 的职责是什么？
15. 为什么需要 task decomposition？
16. 如何让 Agent 自动拆分任务？
17. Agent orchestration layer 需要解决哪些问题？
18. Agent framework（LangChain / AutoGPT / CrewAI）有什么区别？
19. Agent 如何调用 API 或工具？
20. 如何设计 Agent 的 tool registry？
21. Agent 如何避免无限循环调用工具？
22. Agent 的 observation 是什么？
23. Agent state 如何管理？
24. Agent 如何实现 checkpoint / resume？
25. 如何设计一个支持 百万用户调用的 Agent 平台？
26. 为什么 Agent 系统需要 RAG？
27. RAG pipeline 的完整流程是什么？
28. 如何提高 RAG recall？
29. 如何解决 RAG hallucination？
30. 向量检索与关键词检索如何结合？
31. 什么是 hybrid search？
32. 如何设计一个 **100M 文档规模的 RAG 系统**？
33. chunk size 如何选择？
34. RAG 中 rerank 的作用是什么？
35. embedding model 如何选择？
36. 如何评估 RAG 检索质量？
算法题：k个一组链表翻转
37. 为什么 RAG 需要 metadata filtering？
38. 如果检索结果不稳定如何优化？
39. 向量数据库如何设计索引？
40. 如何降低 RAG latency？
41. 什么是 ReAct？
每轮面试一小时，实打实问满，具体可以看图～
#大模型应用 #大模型应用开发 #openclaw #后端开发 #大厂 #面经 #算法 #春招笔试 #校园招聘 #java

#大模型应用 #大模型应用开发 #openclaw #后端开发 #大厂 #面经 #算法 #春招笔试 #校园招聘 #java

## 长图内容（视觉重读）

> [!note] 由 AI 视觉重读截图整理，替代原 tesseract OCR 乱码。图 p02–p08、p01 为 94 题清单卡片（正文已含 Q1–41，这里接续 Q42–94；原文编号跳过 91、92），p10–p16 为表情包贴纸。

**推理与规划（42–59）**

42. ReAct 与 Chain-of-Thought 的区别？
43. Tree-of-Thought 的原理是什么？
44. 如何设计 multi-step reasoning？
45. Agent 如何做 task planning？
46. planning 与 execution 如何解耦？
47. 如何防止 Agent 推理错误？
48. Agent 如何进行 self-reflection？
49. reflection 的 prompt 如何设计？
50. Agent 如何评估自己的答案是否正确？
51. 如何实现 agent self-debug？
52. 多步推理中如何做 intermediate state 存储？
53. 如何让 Agent 在失败后 retry？
54. rag 性能如何提升
55. 你的上下文怎么处理的，有什么优化思路
56. 长短记忆之间怎么做协同呢
57. 多 agent communication 如何设计？
58. 如何实现 agent role specialization？
59. planner-executor 模式是什么？

**多智能体与工程（60–80）**

60. multi-agent 与 single agent 的优劣？
61. 多 agent 如何共享 memory？
62. agent coordination 如何实现？
63. 如何避免 agent deadlock？
64. 如何调度多个 agent？
65. 多 agent 系统如何保证一致性？
66. 多 agent 如何处理冲突任务？
67. 如何设计 agent marketplace？
68. 多 agent 如何实现 consensus？
69. Agent latency 的主要来源有哪些？
70. Agent cost 如何控制？
71. 如何做 Agent caching？
72. Agent system 如何做监控？
73. Agent observability 需要哪些指标？
74. Agent error 如何追踪？
75. Agent 如何做 rate limit？
76. Agent 系统如何支持并发 10 万请求？
77. 如何避免 LLM API timeout？
78. Agent 如何实现 streaming output？
79. Agent 如何支持多模型调度？
80. 如何设计 model routing system？

**评估与安全（81–94，原文无 91/92）**

81. 如何评估 Agent 的成功率？
82. Agent benchmark 有哪些？
83. 如何评估 agent planning 能力？
84. 如何防止 prompt injection？
85. tool injection attack 是什么？
86. 如何防止 agent 数据泄露？
87. agent evaluation dataset 如何构建？
88. 如何做 offline evaluation？
89. 如何做 online A/B testing？
90. agent reliability 如何衡量？
93. 如何做 AI 评论助手？
94. 如何设计一个商家运营 AI Agent？

## 图片

![p01.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p01.webp)
![p02.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p02.webp)
![p03.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p03.webp)
![p04.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p04.webp)
![p05.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p05.webp)
![p06.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p06.webp)
![p07.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p07.webp)
![p08.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p08.webp)
![p10.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p10.png)
![p11.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p11.png)
![p12.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p12.png)
![p13.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p13.png)
![p14.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p14.png)
![p15.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p15.png)
![p16.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69aedd14/p16.png)

## 评论摘录

- **金石为开**：有答案吗
- **hh**：复制，丢给 ds
- **钜屐佴畈**：为什么感觉agent的八股比java简单好多，这些感觉一个月完全可以吸收完
- **钜屐佴畈**：回复 小红薯6313B85C : 感觉现在都混着问
- **用户已注销**：就这？初级岗位吧
- **酷酷小狗的头号小迷弟**：都说不能这么问，来来来，来个人告诉我应该怎么问
- **BR_X**：目前面了五六家的，永远都是深挖项目讲相关经历啊这得多不match才会问这么多八股
- **D**：这不都是最基础的吗
- **Aurora**：agent除了这些也没别的了啊，问verl，areal，on-policy distillation吗
- **小红薯683D1528**：这个笔试要做到什么程度才能进面啊

## 我的批注

- [ ] 是否对标上海实习主线（Agent 应用/全栈）
- [ ] 可迁移到简历/项目的点：
- [ ] 待补学：
