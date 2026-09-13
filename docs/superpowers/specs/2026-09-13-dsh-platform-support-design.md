# DeepSeek Harness 平台支持 — 设计文档

> 日期：2026-09-13
> 状态：已确认（各节经逐节评审）
> 前置讨论：[docs/discussions/2026-09-13-dsh-platform-support.md](../../discussions/2026-09-13-dsh-platform-support.md)（方案对比，选定方案B：平台表驱动）
> 本设计在讨论文档基础上**细化并部分修正**行为语义：由"无条件双写"修正为"默认双写 + 平台存在性门控 + `--platform` 指向"。

## 1. 背景与目标

`bin/cli.js` 目前只装 Claude Code（`~/.claude/skills` + `~/.claude/commands`）。目标：同一套技能同时支持 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）。技能文件格式零改动兼容（dsh 同用 `<name>/SKILL.md`、kebab-case、`name`+`description` frontmatter），改动仅在 CLI 安装逻辑。

dsh 关键差异：用户级技能目录 `~/.dsh/skills/`；**无独立斜杠命令概念**（user-invocable 技能即命令），故 `commands/` 只装 Claude Code。

## 2. 行为模型

所有安装命令（`install` / `upgrade` / `add <skill>`）共用同一套目标平台解析：

1. **存在性是唯一的门**：平台"存在" = 其 home 目录存在（`~/.claude` / `~/.dsh`，目录存在判定）。
2. **默认（无参数）**：遍历平台表，存在的平台即目标；两个都不存在 → 报错退出（见错误处理）。
3. **`--platform claude|dsh`**：只解析到该平台，**但同样过存在性检查**——不存在则跳过并警告，不强制创建。
4. 对每个目标平台：
   - `claude`：技能 → `~/.claude/skills/<name>/SKILL.md`；命令 → `~/.claude/commands/skill/<name>.md`
   - `dsh`：技能 → `~/.dsh/skills/<name>/SKILL.md`（不装命令）
5. 全部平台被跳过（零安装）→ 非零退出码，输出"未安装任何内容"汇总。

输出规范：按平台分组汇总（`[claude] ✓ 8 个技能` / `[dsh] 跳过（~/.dsh 不存在）`）；`list` / `--help` 增加平台目标展示。

## 3. 架构与组件

核心数据结构（`bin/cli.js`，单一事实来源）：

```js
// 平台表 — 未来加平台 = 数组加一项
const PLATFORMS = [
  { id: 'claude', home: '.claude', commands: true  },  // 技能+命令
  { id: 'dsh',    home: '.dsh',    commands: false },  // 仅技能（技能即命令）
]

// 新增：目标平台解析
function resolveTargetPlatforms(platformArg) {
  // platformArg 为空 → 过滤出 existsSync(~/home) 的平台
  // platformArg 指定 → 同样过 existsSync，不存在 → 空结果 + 跳过原因
  // 未知平台名 → 报错并列出可选值
}

// 签名变化：安装函数接收已解析的 targets
installSkill(skillName, targets)     // 遍历 targets 写 SKILL.md
installCommand(commandName, targets) // 仅写 targets 中 commands: true 的平台
```

调用链：`installAll` / `upgradeAll` / `installSkillByName` 开头先 `resolveTargetPlatforms()`，结果向下传递。

参数解析小改：`--platform <id>` 可跟在子命令后（如 `install --platform dsh`），从 `args` 摘出该选项，剩余按位置参数处理。现有无参数用法行为不变（仅多 dsh 检测）。

`showHelp` 更新：

```
sunbirder-skills install [--platform claude|dsh]
sunbirder-skills upgrade [--platform claude|dsh]
sunbirder-skills add <skill> [--platform claude|dsh]
```

## 4. 数据流

安装单元均为原样复制，无内容转换：

| 源文件 | → claude 目标 | → dsh 目标 |
|--------|--------------|-----------|
| `skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` | `~/.dsh/skills/<name>/SKILL.md` |
| `commands/skill/<name>.md` | `~/.claude/commands/skill/<name>.md` | —（不装） |

## 5. 错误处理

| 情形 | 行为 | 退出码 |
|------|------|--------|
| 平台目录不存在（默认或 `--platform` 均如此） | 跳过该平台 + 输出 `跳过 dsh（~/.dsh 不存在）` | — |
| 所有平台都被跳过（零安装） | 汇总输出"未安装任何内容：未检测到已存在的平台目录" | 1 |
| 源文件不存在（仓库缺文件） | 保持现状 fail-fast（仓库完整性错误，与目标平台无关） | 1 |
| 目标写入失败（权限等，目录存在但写不进） | try/catch 单平台失败，警告后继续另一平台，结尾汇总 | 0（部分成功） |

## 6. 测试策略

依赖点：`getHome()` 读 `process.env.HOME` → 测试注入临时目录隔离。新增用例（`__tests__/cli.test.js`）：

1. `resolveTargetPlatforms`：双目录存在→双平台；仅 `.claude`→claude；仅 `.dsh`→dsh；都不存在→空
2. `--platform` 解析：合法值生效；非法值报错并列出可选值
3. `installAll(targets)`：文件落位正确；commands 只写 claude
4. 全部跳过 → 退出码 1

现有测试（文件完整性、列表内容）零影响。

## 7. 范围外（YAGNI）

- 卸载/清理能力
- 技能内容按平台转换（格式已兼容，无需转换）
- `~/.agents/skills/` 通用目录写入（讨论文档方案C，已否决）
- 会话级运行时检测（`CLAUDECODE` / `DSH_*` 环境变量）——已改为目录存在性判定，更符合"机器上有什么装什么"
- 其他平台（codex 等）——平台表已预留扩展点，届时加一项即可

## 8. 后续

spec 批准后进入 writing-plans 生成实施计划；实施完成后按讨论文档清单做 dsh 侧验收（`node bin/cli.js install` 后确认 `~/.dsh/skills/<name>/SKILL.md` 存在且 dsh 会话可识别调用）、同步 `CLAUDE.md` 与文档站说明。
