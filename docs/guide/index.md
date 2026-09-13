# 快速开始

## 安装

```bash
# 方式一：npx 一键安装全部技能
npx github:sunbirder/sunbirder-skill-tools --all

# 方式二：克隆仓库后安装
git clone <repo-url> && cd sunbirder-skill-tools
node bin/cli.js --all
```

### 平台说明

默认安装到所有检测到的平台（`~/.claude` 或 `~/.dsh` 存在即认为该平台已安装）；
`--platform claude|dsh` 可指定单一平台。DeepSeek Harness 侧技能装到 `~/.dsh/skills/`，
dsh 中技能即斜杠命令，无需安装命令文件。

## 使用

安装完成后，在 Claude Code 中直接使用：

- 说 "帮我用 VitePress 展示这些 Markdown 文档" → 自动加载 vitepress-doc-site 技能
- 输入 `/skill:vitepress-doc-site` → 直接调用命令

## 管理

```bash
sunbirder-skills --list                              # 查看已安装的技能与安装目标
sunbirder-skills --all                               # 重新安装全部技能（覆盖更新）
sunbirder-skills vitepress-doc-site                  # 安装指定技能
sunbirder-skills install --platform dsh              # 只安装到 DeepSeek Harness
```
