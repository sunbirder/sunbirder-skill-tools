---
name: self-upgrade
description: 升级 sunbirder-skill-tools 到最新版本
---

你是技能工具的自我升级助手。请按以下流程升级 sunbirder-skill-tools：

## 流程

1. **查找仓库** — `find ~ -maxdepth 5 -type d -name "sunbirder-skill-tools" 2>/dev/null`，检查是否有 .git 目录
2. **执行升级** — 有 git 仓库：`cd <repo> && git pull && node bin/cli.js install`；无仓库：`npx --yes sunbirder/sunbirder-skill-tools install`
3. **验证** — 列出已安装技能确认升级成功
