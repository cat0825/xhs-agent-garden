---
title: "九坤｜大模型 Agent 应用实习生面经 /一面"
tags:
  - 小红书
  - AI-Agent
  - 面经
  - 求职
permalink: "/note/xhs-6a523ec7/"
---

# 九坤｜大模型 Agent 应用实习生面经 /一面

> [!info] 元数据
> - **作者**：你午睡了么
> - **分类**：面经
> - **抓取时间**：2026-07-25T10:15:29Z
> - **原文**：[打开小红书笔记](https://www.xiaohongshu.com/search_result/6a523ec7000000000f007c2c
> - **互动**：242 / 369 / 27

## 正文

个人感觉面试官水平很高，面试过程和聊天一样#面经 #大厂 #大模型 #找实习

#面经 #大厂 #大模型 #找实习 #作者

## 长图内容（视觉重读）

> [!note] 由 AI 视觉重读截图整理，替代原 tesseract OCR 乱码。图 p02 为封面卡片，p03–p05 为 20 道面试题文字卡片，p01 为末页残句，p07–p09 为表情包贴纸。

整体以开放讨论和项目深挖为主，没有手撕代码，主要考察 Agent 产品理解、模型选型以及后训练基础。

**产品与 Agent 架构（前半场）**

1. 你了解哪些常见的 Agent 架构？项目为什么选择 Workflow Agent？
2. 为什么要做这个 Agent 产品？它主要解决什么问题？
3. 这是通用 Agent 还是垂直 Agent？核心竞争力是什么？
4. 主要竞品或对标产品有哪些？相比竞品有什么优势？
5. 你在整个 Agent 项目中负责什么？与其他模块如何协作？
6. 为什么想从 Workflow Agent 进一步转向 Agentic RL？
7. Agent 主模型、Memory 模型和多模态模型分别如何选型？
8. 系统是否有 fallback、Embedding 和 Rerank 模型？如何平衡效果、延迟与成本？
9. 为什么要用后训练的小模型替换商业大模型？

**后训练深挖（后半场）**

10. 介绍一下做过的日历信息抽取任务，以及为什么只用 SFT。
11. 介绍一下实体消歧任务，它的输入、输出和数据集是怎么设计的？
12. 为什么实体消歧模型经过 SFT 后仍然过于保守？
13. 为什么在 SFT 之后继续使用 DPO？DPO 数据是如何构造的？
14. 请写出 DPO Loss，并解释 chosen、rejected、reference model 和 β。
15. 如果 chosen loss 和 rejected loss 同时下降，应该如何分析？
16. 什么是 On-Policy Distillation？具体训练流程是什么？
17. OPD 与传统知识蒸馏、Teacher 生成数据做 SFT 有什么区别？
18. 如果商业模型 API 不提供 logits，还能否进行标准 OPD？有什么替代方案？
19. 多智能体强化学习中的信用分配是什么？为什么需要对全局奖励进行分配？
20. 为什么选择当前论文投稿方向？实验室研究方向与 Agent 岗位有什么关系？

**整体感受**：业务和技术混合考察，前半部分偏产品与 Agent 架构，后半部分重点深挖简历中写到的后训练经历。DPO、OPD、蒸馏这类内容不仅要会讲业务效果，最好能掌握公式、训练流程和不同方法之间的边界。

## 图片

![p01.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p01.webp)
![p02.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p02.webp)
![p03.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p03.webp)
![p04.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p04.webp)
![p05.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p05.webp)
![p07.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p07.png)
![p08.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p08.png)
![p09.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6a523ec7/p09.png)

## 评论摘录

- **Mystic**：是坤启吗我当时横向了三周
- **🐢了个🐢**：面啥九坤，来面衍复
- **特伦海**：给我挂了
- **momo**：面试官是不是有些口音？
- **米奇妙妙屋**：这是 agent 开发还是算法岗啊，怎么后面问的都是算法的东西
- **你午睡了么（作者）**：感觉偏算法
- **柯基跑不快**：也是研一么，手撕怎么练的呀
- **你午睡了么（作者）**：今年研二了，手撕可以看代码随想录，刷刷力扣啥的
- **地瓜**：所以为什么要做这个产品

## 我的批注

- [ ] 是否对标上海实习主线（Agent 应用/全栈）
- [ ] 可迁移到简历/项目的点：
- [ ] 待补学：
