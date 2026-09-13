# sunbirder-skill-tools

个人 Claude Code 技能工具集。CLI（`bin/cli.js`）将技能 Markdown 文件复制到目标机器的 `~/.claude/skills/` 目录，同时将斜杠命令复制到 `~/.claude/commands/`。实际"执行"由 Claude Code 在运行时解释这些 Markdown 提示词完成。

## 技术栈

- JavaScript (ESM) — CLI 脚本
- Markdown — 技能定义和命令文件
- VitePress — 文档站点
- Jest — 测试

## 架构

- `bin/cli.js` — CLI 入口，多平台安装：默认安装到所有检测到的平台（按 home 目录存在判定），`--platform claude|dsh` 可指定单一平台
  - Claude Code：技能 → `~/.claude/skills/`，命令 → `~/.claude/commands/`
  - DeepSeek Harness：技能 → `~/.dsh/skills/`（dsh 技能即斜杠命令，无命令目录）
- `skills/` — 技能定义（Markdown + YAML frontmatter），格式与两个平台兼容，无需按平台区分
- `commands/` — 斜杠命令（Markdown + YAML frontmatter，仅 Claude Code 使用）
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
