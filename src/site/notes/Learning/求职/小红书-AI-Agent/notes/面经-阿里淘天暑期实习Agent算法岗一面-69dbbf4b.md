---
title: "阿里淘天暑期实习Agent算法岗一面"
tags:
  - 小红书
  - AI-Agent
  - 面经
  - 求职
permalink: "/note/xhs-69dbbf4b/"
---

# 阿里淘天暑期实习Agent算法岗一面

> [!info] 元数据
> - **作者**：学长学姐帮
> - **分类**：面经
> - **抓取时间**：2026-07-25T10:16:48Z
> - **原文**：[打开小红书笔记](https://www.xiaohongshu.com/search_result/69dbbf4b000000001a02a430
> - **互动**：96 / 168 / 2

## 正文

淘天集团 · Agent智能客服方向
核心题目：
1. Attention本质是什么？请从向量空间变换角度解释—
本质是高维语义空间中 Query 与 Key 的动态相似性映射，对 Value 重加权实现上下文感知的信息选择与重组。三步：①Q/K/V线性投影到子空间 ②QK^T/√dk计算相似度+Softmax归一化 ③AV动态仿射组合。
2. 多轮对话中Attention如何导致历史信息衰减？—
两大根源：①Softmax归一化的"注意力分散"——长序列中强相关早期token被大量无关Key摊薄（如1000token中仅占0.5%） ②Position Encoding局限——超长距离依赖建模有限，RoPE/ALiBi缓解但未根治。
3. SFT数据清洗的具体流程？遇到低质量数据怎么处理？—
四阶段：①格式完整性校验 ②语言质量过滤 ③语义合理性评估（SBERT相关性+二分类有用性模型+安全API） ④5%人工抽检+bad case回流。低质量数据处理：硬过滤（乱码广告直接删）/ 软修正（Grammar Correction）/ 降权训练（边界样本权重降低）/ 对抗增强（bad case做负样本）
4. RAG的chunk优化策略有哪些？怎么评估检索相关性？—
最终方案：段落为单位+滑动窗口（window=256/stride=64）+首尾添加上下文摘要提示。
5. DPO训练中梯度爆炸如何解决？（一面）—
根源：log-ratio项数值不稳定（πθ(yl)→0导致log-ratio趋向无穷）。五步解法：①Logits Clipping（clamp到±10） ②Numerical Stable计算（torch.log_softmax避免先prob再log） ③Gradient Clipping（max_norm=1.0） ④Preference Data Filtering（过滤reference差值>5的样本） ⑤Warm-up+Small LR（1e-6 warmup 100步→2e-6）。β调参经验：太小（0.1）不学习偏好，太大（10）过拟合→最佳区间0.5~2.0，β=1.0验证集最优。训练稳定性从60%→95%。
	
#互联网大厂 #面试 #面经 #暑期实习#大模型

#互联网大厂 #面试 #面经 #暑期实习 #大模型 #作者

## 长图内容（视觉重读）

> [!note] 由 AI 视觉重读截图整理，替代原 tesseract OCR 乱码。8 张卡片是 5 题的展开版，以下只记录**比正文多出**的信息。

### 面试概况（图 p02 / p03）

- 阿里巴巴·淘天集团，Agent 算法暑期实习一面，2026 年 3 月，90 分钟，5 道核心题，无八股背诵
- 核心考察逻辑："你能不能用技术解决真实问题"——每道题都追问"为什么用这个方案？有什么副作用？"
- 面试官风格：问题不刁钻，但每道都追问动机和权衡："除了这个方案，还有什么替代选择？为什么不用？"

### 各题补充细节（图 p04–p08）

**Q1 Attention 本质**（p04）：追问"Attention 和 RNN/CNN 在信息传递上有何本质区别？"——满分回答：RNN 顺序单向→梯度消失；CNN 局部感受野→无长距离建模；Attention 是全连接+内容驱动的"软连接"，不依赖固定拓扑，根据 Query 内容动态决定与哪些 Key 交互。

**Q2 历史信息衰减**（p05）：比正文多一个根源三——Attention 的对称性假设：标准 Self-Attention 假设所有 token 对影响对称，但对话中信息流高度非对称，这种不对称性未被显式建模。**项目经验加分项（分层记忆架构）**：短期用标准 Transformer 处理最近 4 轮保留细粒度交互；长期用轻量摘要模块（BERT/小型 LLM）定期压缩早期对话生成 1-2 句摘要插入当前上下文；显式引用 `[HISTORY_SUMMARY]` 占位符，训练时监督引用。结果：5 轮以上对话意图一致性提升 12.3%。

**Q3 SFT 数据清洗**（p06）：四阶段量化细节——阶段1 剔除空对话/单轮对话/含敏感词样本；阶段2 PPL>1000 剔除 + 语法错误检测模型 + 连续 3 个相同句子检测；阶段3 SBERT 相关性 <0.3 剔除 + DeBERTa 微调的"有用性"二分类 + 阿里云内容安全 API；阶段4 建立误删/漏删分析库迭代规则。实测：100 万条原始数据 → 68 万条高质量样本，SFT 后任务完成率 +18.7%。降权训练针对相关性 0.25~0.35 的边界样本。

**Q4 RAG Chunk 优化**（p07）：为什么不用固定 512——可能切断句子/段落、语义边界检测开销大、滑动窗口在信息完整与覆盖之间平衡最优。**三层评估体系**：①离线指标 Hit Rate@K、NDCG@K、Embedding Cosine Similarity ②在线 A/B：任务完成率/用户停留时长/追问率 ③Bad Case 四分类：漏检/误检/排序错误/信息碎片。实测：固定 512→语义滑动窗口，Hit Rate@3 62%→78%。追问"模糊 query 怎么处理"：①对话状态跟踪 DST 小模型解析上下文提取实体槽位（"那个东西"→"智能音箱"）②Query 改写为明确 query。

**Q5 DPO 梯度爆炸**（p08）：根源补充——即使用 reference model 归一化，若 π_ref(yl|x) 也很小问题依旧存在；Preference Data Filtering 还过滤 yl 的 ref log-prob < -15 的样本。

### 答题技巧与备考（图 p01）

- 差回答 vs 好回答：只说"Attention 是加权求和" ✗ → 讲清三步投影+仿射组合+多头并行，并对比 RNN/CNN ✓；SFT 清洗只说"过滤了低质量数据" ✗ → 给量化结果（100万→68万、+18.7%）并解释多样性保障机制（分桶采样+n-gram entropy 监控）✓
- **备考三条主线**：① 原理"为什么"（Attention→向量空间变换动机；BN/LN→归一化维度依赖；RoPE→外推性）② 工程量化经验——数字比话术有说服力 ③ 权衡思维——每讲一个方案必带副作用和替代选择（Q-Former vs MLP、固定 vs 滑动窗口、硬过滤 vs 降权）

## 图片

![p01.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p01.webp)
![p02.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p02.webp)
![p03.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p03.webp)
![p04.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p04.webp)
![p05.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p05.webp)
![p06.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p06.webp)
![p07.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p07.webp)
![p08.webp](/img/user/Learning/求职/小红书-AI-Agent/assets/xhs-69dbbf4b/p08.webp)

## 评论摘录

- **学长学姐帮（作者）**：持续进步

## 我的批注

- [ ] 是否对标上海实习主线（Agent 应用/全栈）
- [ ] 可迁移到简历/项目的点：
- [ ] 待补学：
