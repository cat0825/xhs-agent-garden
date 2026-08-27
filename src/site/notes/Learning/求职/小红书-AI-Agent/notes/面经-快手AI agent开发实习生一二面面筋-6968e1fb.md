---
title: "快手AI agent开发实习生一二面面筋"
tags:
  - 小红书
  - AI-Agent
  - 面经
  - 求职
permalink: "/note/xhs-6968e1fb/"
---

# 快手AI agent开发实习生一二面面筋

> [!info] 元数据
> - **作者**：Stellar鱼
> - **分类**：面经
> - **抓取时间**：2026-07-25T10:15:19Z
> - **原文**：[打开小红书笔记](https://www.xiaohongshu.com/search_result/6968e1fb000000000a03c4b4
> - **互动**：521 / 854 / 34

## 正文

快手AI agent开发实习生一二面面筋
技术栈：Python＋go（有两段后端实习）
一面：
首先是实习做的项目相关：
- 为什么引入父子索引，为什么引入BM25，比例是怎样的，具体流程是什么，有没有rerank
- rerank后返回几个块，有没有做一些验证
- rerank后的topk截断是怎么做的，为什么是这个值，有没有其他方案
- 讲一下上下文工程，记忆是怎么做的
- 问实习做的后端项目的问题
- 分布式令牌桶限流讲一下，漏桶讲一下，滑动窗口算法限流讲一下，如果用滑动窗口结构体会包含什么字段，滑动窗口和令牌桶相比有什么确定，用redis的什么数据结构实现
- 问自己做的项目，lru讲一下
- 布隆过滤器讲一下
- 索引失效的情况（MySQL八股有点忘了，只讲出来两个，被追问了）
- like会不会失效
- MySQL事物隔离一致性讲一下
- mvcc细说，详细追问，问你这种情况会创造几个readview
- MySQL锁讲一下
手撕：我说我最近实习，很久没刷过题了，出了一道反转链表
	
二面：
全是agent，rag相关的，项目相关的，不涉及后端
细问rag项目
- 如何评测的，有哪些纬度，那些指标
- 数据集包括什么
- 如果让你对相关度，回答的效果做一些优化，你有什么思路，有没有什么更体系化的思路建设
- 如果设计一个数据处理的场景，你会怎么做，比方说有一千条数据，需要求和，你怎么做处理
- rag性能如何提升
- 你的上下文怎么处理的，有什么优化思路
- 长短记忆之间怎么做协同呢
- 你有什么思路去对你的agent做优化，让他更智能呢（我感觉这个问题太泛了 不知道具体在问什么，我回答主要针对工程遇到的问题做优化）
手撕： 全排列（a了）
	
反问：可能有三面 or hr面
业务是做一些内部agent工具和平台
技术栈（Python＋内部框架）
	
许愿后续#面经

#面经 #作者

## 长图内容（视觉重读）

> [!note] 由 AI 视觉重读截图整理，替代原 tesseract OCR 乱码。

### 图 p01–p05：面经文字卡片，内容与正文一致，无额外信息

### 图 p07–p10：表情包贴纸，无面经内容

## 图片

![p01.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p01.webp)
![p02.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p02.webp)
![p03.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p03.webp)
![p04.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p04.webp)
![p05.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p05.webp)
![p07.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p07.png)
![p08.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p08.png)
![p09.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p09.png)
![p10.png](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-6968e1fb/p10.png)

## 评论摘录

- **那一点风**：佬，问一下agent岗对后端大概要掌握到什么程度，看面经好像大部分都是中间件的样子
- **Stellar鱼（作者）**：我面的是比较交叉的岗位，jd里面就包括对后端和agent的要求，所以包含很多后端内容，其次我感觉如果做agent学一些后端应该也是必要的，毕竟最后还是要工程实现。掌握程度的话，MySQL，redis相关的八股熟悉一下比较好
- **超级无敌狠**：大佬手撕怎么练的
- **Stellar鱼（作者）**：纯靠力扣hot100，u1s1我手撕比较薄弱了
- **shushu**：感觉佬很强我现在只能干测开，也想转agent，佬方便说说什么bg吗
- **Stellar鱼（作者）**：是9本，现在大三
- **xgd突击兵**：日常实习吗
- **Stellar鱼（作者）**：这个点暑假应该没开，应该是日常吧
- **chunksize**：综合产品中心？
- **小红薯67A0D945**：佬，这些agent项目的优化方案是怎么想的呀，感觉自己都是网上的项目能跑起来之后也不知道该怎么去转化为自己的项目了，没什么改进和深度

## 我的批注

- [ ] 是否对标上海实习主线（Agent 应用/全栈）
- [ ] 可迁移到简历/项目的点：
- [ ] 待补学：
