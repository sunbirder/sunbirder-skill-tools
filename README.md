# sunbirder-skill-tools

个人 Claude Code 技能工具集，可通过 `npx` 或 `git clone` 安装到任意机器。

## 安装

```bash
# npx 一键安装全部技能
npx sunbirder/sunbirder-skill-tools install

# npx 安装指定技能
npx sunbirder/sunbirder-skill-tools add vitepress-doc-site

# 本地安装
git clone <repo-url> && cd sunbirder-skill-tools
node bin/cli.js install
```

## 技能列表

| 技能 | 说明 |
|------|------|
| `vitepress-doc-site` | 将 Markdown 文件搭建为 VitePress 文档网站 |

## 命令

```bash
sunbirder-skills install               # 安装全部技能
sunbirder-skills add <name>            # 安装指定技能
sunbirder-skills list                  # 列出可用技能
```

## 开发

```bash
npm test                               # 运行测试
npm run docs:dev                       # 启动文档站
npm run docs:build                     # 构建文档站
```
