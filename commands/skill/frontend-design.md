---
name: skill:frontend-design
description: 前端视觉设计 — 反AI模板脸的美学方向/排版/布局决策（vendor 自 anthropics/skills）
argument-hint: [设计 brief 或页面描述]
---

# 前端视觉设计

为新 UI 或改造已有 UI 提供独特、有主见的视觉设计——美学方向、排版、布局，避免"AI 生成模板脸"。

<objective>
产出设计 token 方案（4-6 个命名 hex 色 + 字体角色 + 布局概念 + 设计原则）并自审反模板后，落地为代码或 CSS 变量。
</objective>

<rules>
- 先加载 frontend-design 技能获取完整设计原则与两遍法工作流
- 设计 brief 优先来自 prd-flow 页面工件（docs/reqs/<产品名>/pages/PGE-*.md），存在时先读再设计
- 对接文档站时 token 翻译为 CSS 变量注入 theme/layout.css，布局选择器禁改
- 一切面向用户的产出文案使用中文
</rules>

<process>
1. 读取 brief（用户输入或 PGE 工件）
2. 出设计 token 方案（色板/字体/布局/原则）
3. 对照反 AI 模板清单自审并修订
4. 写码实现；真浏览器截图自审
</process>
