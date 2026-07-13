# 技能列表

当前可用技能：

| 技能 | 命令 | 说明 |
|------|------|------|
| vitepress-doc-site | `/skill:vitepress-doc-site` | 将 Markdown 文件搭建为 VitePress 文档网站 |
| discuss | `/skill:discuss` | 轻量方案讨论 — 对比选项、确认方向、沉淀结论 |
| docs-sync | `/skill:docs-sync` | 文档与代码对齐 — 扫描变更、对比文档、修正过时 |
| doc-gen | `/skill:doc-gen` | 项目文档生成 — 扫描代码，生成完整开发文档 |

## 安装单个技能

```bash
node bin/cli.js vitepress-doc-site
```

这将安装：
- `~/.claude/skills/vitepress-doc-site/SKILL.md` — 技能定义
- `~/.claude/commands/skill/vitepress-doc-site.md` — 斜杠命令
