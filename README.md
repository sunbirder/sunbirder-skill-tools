# sunbirder-skill-tools

个人技能工具集，支持 Claude Code 与 DeepSeek Harness 双平台，可通过 `npx` 或 `git clone` 安装到任意机器。

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

### 平台说明

- 默认安装到所有检测到的平台（按 `~/.claude` / `~/.dsh` 目录是否存在判定），平台不存在则自动跳过
- `--platform claude|dsh` 可指定单一平台（目标平台不存在时同样跳过）
- Claude Code：技能装到 `~/.claude/skills/`，斜杠命令装到 `~/.claude/commands/`
- DeepSeek Harness：技能装到 `~/.dsh/skills/`（dsh 中技能即斜杠命令，无需单独的命令目录）

## 技能列表

| 技能 | 说明 |
|------|------|
| `vitepress-doc-site` | 将 Markdown 文件搭建为 VitePress 文档网站 |
| `discuss` | 轻量方案讨论 — 对比选项、确认方向、沉淀结论 |
| `docs-sync` | 文档与代码对齐 — 扫描变更、对比文档、修正过时 |
| `doc-gen` | 项目文档生成 — 扫描代码，生成完整开发文档 |
| `docs-all-in-one` | 一站式 web 文档 — 生成完整文档集并搭建 VitePress 文档站 |
| `sidebar-sync` | VitePress 侧边栏同步 — 补齐缺失菜单入口，清理死链 |
| `self-upgrade` | 自升级 — 自动查找仓库或 npx 升级到最新版 |
| `wxapkg-unpack` | 微信小程序解包 — 解密 wxapkg 并反编译为可读工程 |
| `disk-clean` | macOS 磁盘清理 — 排查大项、清理可再生缓存、大文件清单交用户决定 |

## 使用

安装完成后，在 Claude Code 对话中直接输入斜杠命令即可调用技能：

```bash
/skill:vitepress-doc-site    # 将 Markdown 文件搭建为 VitePress 文档网站
/skill:discuss              # 启动轻量方案讨论
/skill:docs-sync            # 项目文档与代码对齐
/skill:doc-gen              # 根据项目生成完整开发文档
/skill:docs-all-in-one       # 一站式：生成文档集 + 搭建文档站 + 启动预览
/skill:sidebar-sync           # 侧边栏同步：补齐缺失菜单入口，清理死链
/skill:self-upgrade          # 升级技能工具到最新版
/skill:wxapkg-unpack         # 解密并反编译微信小程序包
/skill:disk-clean            # macOS 磁盘清理
```

每条命令会在对话中展开为完整的技能提示词，Claude Code 根据提示词执行对应任务。

## 命令

```bash
sunbirder-skills install [--platform claude|dsh]      # 安装全部技能
sunbirder-skills upgrade [--platform claude|dsh]      # 拉取最新代码并重新安装
sunbirder-skills add <name> [--platform claude|dsh]   # 安装指定技能
sunbirder-skills list                                 # 列出可用技能与安装目标
```

## 开发

```bash
npm test                               # 运行测试
cd docs && npm run dev                  # 启动文档站
cd docs && npm run build                # 构建文档站
```
