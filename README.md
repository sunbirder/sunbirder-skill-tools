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
| `discuss` | 轻量方案讨论 — 对比选项、确认方向、沉淀结论 |
| `docs-sync` | 文档与代码对齐 — 扫描变更、对比文档、修正过时 |
| `doc-gen` | 项目文档生成 — 扫描代码，生成完整开发文档 |

## 使用

安装完成后，在 Claude Code 对话中直接输入斜杠命令即可调用技能：

```bash
/skill:vitepress-doc-site    # 将 Markdown 文件搭建为 VitePress 文档网站
/skill:discuss              # 启动轻量方案讨论
/skill:docs-sync            # 项目文档与代码对齐
/skill:doc-gen              # 根据项目生成完整开发文档
```

每条命令会在对话中展开为完整的技能提示词，Claude Code 根据提示词执行对应任务。

## 命令

```bash
sunbirder-skills install               # 安装全部技能
sunbirder-skills add <name>            # 安装指定技能
sunbirder-skills list                  # 列出可用技能
```

## 开发

```bash
npm test                               # 运行测试
cd docs && npm run dev                  # 启动文档站
cd docs && npm run build                # 构建文档站
```
