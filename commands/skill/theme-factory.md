---
name: skill:theme-factory
description: 主题工厂 — 10 个预设主题应用到幻灯片/文档/落地页（vendor 自 anthropics/skills）
argument-hint: [目标工件] [主题名]
---

# 主题工厂

将预设主题（色板 + 字体搭配）应用到幻灯片、文档、HTML 落地页等工件。

<objective>
展示 10 个预设主题供选择，确认后将选定主题的色板与字体搭配一致地应用到目标工件。
</objective>

<rules>
- 先加载 theme-factory 技能获取主题清单与应用规范
- 应用前必须让用户明确选定主题（展示 theme-showcase.pdf 或列出主题名）
- 对接 VitePress 文档站时翻译为 CSS 变量注入 theme/layout.css，布局选择器禁改
- 一切面向用户的产出文案使用中文
</rules>

<process>
1. 列出可用主题（或展示 showcase）
2. 用户选定
3. 应用色板 + 字体到目标工件
4. 验收渲染效果
</process>
