# theme-factory

主题工厂 — 10 个预设主题（色板 + 字体搭配）一键应用到幻灯片/文档/落地页。

> Vendor 自 [anthropics/skills](https://github.com/anthropics/skills)（Apache 2.0），原样收录未改动（含 10 个主题定义与主题总览 PDF）。

## 触发条件

- 用户说 "给这个 PPT/页面换个主题" / "列出可用主题"
- 文档站首页 hero 区需要配色方案
- 需要快速统一一套物料的视觉风格

## 核心能力

1. **10 个预设主题**：sunset-boulevard / tech-innovation / arctic-frost / modern-minimalist / golden-hour / midnight-galaxy / forest-canopy / ocean-depths / desert-rose / botanical-garden
2. **应用流程**：展示 theme-showcase.pdf → 用户选主题 → 确认 → 应用（色板 hex + 标题/正文字体搭配）
3. **自定义主题**：theme-config.json 变量（主色调/衬线/无衬线/背景）

## 与本工具链的衔接

| 场景 | 做法 |
|------|------|
| VitePress 文档站 | 主题 token 翻译为 CSS 变量注入 `theme/layout.css`（布局选择器禁改，见 vitepress-doc-site） |
| 与 frontend-design 分工 | 整体视觉方向 → frontend-design；已有内容快速套皮 → theme-factory |
| prd-flow | 评审物料/演示文稿的统一视觉 |

## 示例

```bash
/skill:theme-factory          # 或"把 botanical-garden 主题应用到我的幻灯片"
```

## 版权

Apache 2.0（见技能目录 LICENSE.txt）。
