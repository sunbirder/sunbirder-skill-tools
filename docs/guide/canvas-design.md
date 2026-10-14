# canvas-design

视觉艺术设计 — 以设计哲学驱动，产出海报/PDF/PNG。

> Vendor 自 [anthropics/skills](https://github.com/anthropics/skills)（Apache 2.0），原样收录未改动（含 81 个 OFL/Apache 开源字体，约 5.5M）。

## 触发条件

- 用户说 "设计一张海报" / "做个宣传单页" / "给这个活动出视觉稿"
- prd-flow 页面设计需要单图视觉稿（非交互原型）

## 核心能力

1. **两步创作**：先写「视觉哲学宣言」（命名流派 + 4-6 段美学论述），再据此在画布上视觉化表达
2. **字体即艺术**：81 个精选开源字体（`canvas-fonts/` 随技能分发），排版参与构图而非仅承载信息
3. **极简纪律**：元素不重叠不出界、留白呼吸感非硬性要求、改稿靠精炼既有构图而非堆新图形

## 与本工具链的衔接

| 场景 | 做法 |
|------|------|
| prd-flow Step 05 | PGE 页面定稿后，对需要视觉冲击的营销页/落地页调用本技能出单图稿 |
| 与 frontend-design 分工 | 前端界面 → frontend-design；海报/单图/封面 → canvas-design |
| 产出格式 | PNG（首选）/ PDF（有内容重叠 bug，质量更高时用）/ 不用 SVG 打印 |

## 示例

```bash
/skill:canvas-design   # 或"为 XX 发布会设计一张极简海报"
```

## 版权

Apache 2.0（见技能目录 LICENSE.txt）；字体各自遵循其 OFL/Apache 许可（`*-OFL.txt`）。
