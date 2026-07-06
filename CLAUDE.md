# sunbirder-skill-tools

个人 Claude Code 技能工具集。CLI（`bin/cli.js`）将技能 Markdown 文件复制到目标机器的 `~/.claude/skills/` 目录，同时将斜杠命令复制到 `~/.claude/commands/`。实际"执行"由 Claude Code 在运行时解释这些 Markdown 提示词完成。

## 技术栈

- JavaScript (ESM) — CLI 脚本
- Markdown — 技能定义和命令文件
- VitePress — 文档站点
- Jest — 测试

## 架构

- `bin/cli.js` — CLI 入口，负责安装技能到 `~/.claude/skills/<name>/SKILL.md`
- `skills/` — 技能定义（Markdown + YAML frontmatter）
- `commands/` — 斜杠命令（Markdown + YAML frontmatter）
- `docs/` — VitePress 文档站点

## 约束

- 纯 JavaScript + Markdown（无 TypeScript）
- 技能目录命名: kebab-case
- 新增技能需更新 `bin/cli.js` 中的 `SKILL_LIST` 和 `COMMAND_LIST`
- 所有用户文本使用中文

## 常用命令

```bash
npm test
cd docs && npm run dev
cd docs && npm run build
```
