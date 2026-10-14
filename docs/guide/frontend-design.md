# frontend-design

前端视觉设计指导 — 做出有主见、不像 AI 模板的界面设计。

> Vendor 自 [anthropics/skills](https://github.com/anthropics/skills)（Apache 2.0），sunbirder-skill-tools 维护版：追加与 prd-flow / vitepress-doc-site 的衔接节，原文未改。

## 触发条件

- 用户说 "帮我设计这个页面" / "这个界面太丑/太模板化"
- prd-flow Step 05 页面设计（PGE 工件）定稿后要出视觉方案
- 新项目要定设计系统（色板/字体/风格）

## 核心能力

1. **反 AI 模板脸校准** — 内置 5 类 AI 生成特征清单（米色底+赤陶色、酸绿单点缀、报纸风、SaaS 卡片流水线、全大写眉标等），设计前自审避雷
2. **两遍法工作流** — 先出 token 方案（4-6 个命名 hex 色 + 字体角色 + 布局概念 + 原则）→ 对照 brief 自审"这是不是任何同类项目都会得到的默认解"→ 修订后才写码
3. **排版/文案原则** — 字体作为设计主角、80 字符行宽、动词化 CTA（"保存修改"不是"提交"）、错误文案不道歉不模糊

## 与本工具链的衔接

| 场景 | 做法 |
|------|------|
| 输入 | prd-flow 的 `docs/reqs/<产品名>/pages/PGE-*.md`（五态+字段表+分区）就是现成 brief，先读再设计 |
| 产出对接文档站 | token 方案翻译为 CSS 变量注入 `theme/layout.css`；**布局皮肤选择器按 VitePress 1.6.4 实测，禁改** |
| 验收 | 真浏览器截图自审（与 vitepress-doc-site L2 分级一致） |
| 用户文本 | 指导原则保留英文（上游可同步），一切面向用户的产出用中文 |

## 示例

```bash
/skill:frontend-design   # 或直接说"按 PGE-10 群发短信页做视觉设计"
```

## 版权

Apache 2.0（见技能目录 LICENSE.txt）；上游更新时 diff 同步本目录。
