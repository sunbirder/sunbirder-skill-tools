# self-upgrade

升级 sunbirder-skill-tools 到最新版本。

## 触发条件

- 输入 `/skill:self-upgrade`
- 说 "升级技能工具" 或 "更新 sunbirder-skills"

## 流程

1. **查找仓库** — 搜索本地的 sunbirder-skill-tools git 仓库
2. **执行升级** — 有 git 仓库：`git pull && node bin/cli.js install`；无仓库：`npx --yes sunbirder/sunbirder-skill-tools install`
3. **验证** — 列出已安装技能确认

## 注意

升级后部分技能文件可能在当前会话中已缓存，需重启 Claude Code 或新开会话才能使用最新版本。
