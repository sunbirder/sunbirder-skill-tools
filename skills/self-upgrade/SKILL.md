---
name: self-upgrade
description: 升级 sunbirder-skill-tools 本身 — 自动查找本地仓库拉取最新代码，或通过 npx 升级安装
---

# 自升级

升级 sunbirder-skill-tools 到最新版本。

## 流程

### 第一步：查找安装位置

搜索本地是否有 git clone 的仓库：

```bash
find ~ -maxdepth 5 -type d -name "sunbirder-skill-tools" 2>/dev/null
```

找到且有 `.git` 目录 → 走本地升级  
未找到 → 走 npx 升级

### 第二步：执行升级

**本地升级（有 git 仓库）：**

```bash
cd <repo-path> && git pull && node bin/cli.js install
```

**npx 升级（无本地仓库）：**

```bash
npx --yes sunbirder/sunbirder-skill-tools install
```

### 第三步：验证

升级完成后，列出当前已安装的技能确认：

```bash
node bin/cli.js list
# 或
ls ~/.claude/skills/
```

## 注意

- 部分技能文件可能在 Claude Code 当前会话中已加载，升级后需重启 Claude Code 或开启新会话才能使用最新版本
- 如果 find 找到多个仓库，让用户选择
