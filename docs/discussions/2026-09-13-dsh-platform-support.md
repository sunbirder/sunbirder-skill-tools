# 支持 DeepSeek Harness 平台

> 讨论日期：2026-09-13
> 状态：已确认 — 方案B（平台表驱动）
> 参与方：sunbirder × Claude Code

## 1. 问题背景

sunbirder-skill-tools 目前只支持 Claude Code：`bin/cli.js` 将技能安装到 `~/.claude/skills/`、斜杠命令安装到 `~/.claude/commands/`。现在需要同时支持 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）平台。

### DeepSeek Harness 调研结论

dsh 是 DeepSeek AI 官方开源的 agent harness（"everything-is-a-plugin" 架构，基于 Cordis），处于 developer preview（官方明示会有 breaking changes）。其技能系统与 Claude Code 高度同构：

| 维度 | Claude Code | DeepSeek Harness |
|------|------------|------------------|
| 技能格式 | `<name>/SKILL.md` | `<name>/SKILL.md` 或 `<name>.md`，完全一致 |
| frontmatter | `name` + `description` | `name` + `description` 必填；可选 `whenToUse` / `user-invocable` / `disable-model-invocation`；多余字段进 metadata 忽略 |
| 命名 | kebab-case | kebab-case 正则 `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| 用户级技能目录 | `~/.claude/skills/` | `~/.dsh/skills/`（user-dsh，rank 400）；`~/.agents/skills/`（user-agents，rank 500，通用 agents 约定） |
| 斜杠命令 | 单独的 `~/.claude/commands/` | 无独立概念 — user-invocable 技能本身就是斜杠命令 |

关键结论：

1. 本仓库 8 个技能的 SKILL.md（`name`+`description`，kebab-case）**零改动即兼容** dsh
2. `commands/` 目录是 Claude Code 专属，dsh 不需要
3. 改动核心仅在 `bin/cli.js` 的安装目标逻辑，技能内容不动

依据来源：[dsh Skills 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)（本地发现优先级表、技能身份、frontmatter 键）、[config-catalog](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/config-catalog.md)（`dshHome` 默认 `$DSH_HOME` 或 `~/.dsh`；`agentsHome` 默认 `$DSH_AGENTS_HOME` 或 `~/.agents`）。

## 2. 方案对比

改动核心都在 `bin/cli.js`：目标目录硬编码于 `getSkillsTarget()` / `getCommandsTarget()`（原 17-23 行），技能安装 `installSkill()`（原 109-127 行），命令安装 `installCommand()`（原 129-150 行）。

| 维度 | 方案A：最小双写 | 方案B：平台表驱动 ✅ | 方案C：写通用 agents 目录 |
|------|---------------|------------------|--------------------------|
| 思路 | `installSkill` 里直接多写 `~/.dsh/skills/`；commands 逻辑不动 | 定义 `PLATFORMS` 表（claude：skills+commands；dsh：仅 skills），安装函数遍历平台表，commands 为 null 的平台跳过 | 技能只写 `~/.agents/skills/`，dsh 经 user-agents root 自动发现 |
| 优点 | 改动最小（~15 行）；语义直白 | 扩展点明确 — 未来加平台=数组加一项；`list`/`--help` 可按平台展示安装目标；结构诚实反映"多平台安装"本质 | 未来其他读 `~/.agents` 的工具自动受益 |
| 缺点 | 下一个平台还要再改函数体 | 比 A 多 ~20 行；抽象略超前（但很薄） | 间接支持：dsh 主目录 `~/.dsh/skills` rank 更高，两处并存易混淆；生效依赖工具实现 `.agents` 约定 |
| 复杂度 | 低 | 低~中 | 低 |

## 3. 最终决定

**采用方案B：平台表驱动，dsh 目标 `~/.dsh/skills/`。**

理由：

1. 需求本质是"从单平台变多平台"，表驱动是对需求的直接建模，不是过度设计
2. `~/.dsh/skills` 是 dsh 官方默认 user root 且 rank 优先级（400）高于 `~/.agents/skills`（500），支持意图最明确
3. 方案C 的通用目录红利目前是 YAGNI — dsh 自己同时读两个 root，装 `~/.dsh` 一处即可

## 4. 后续步骤

- [ ] `bin/cli.js`：新增 `PLATFORMS` 表（`claude` → skills+commands，`dsh` → 仅 skills），`installSkill`/`installCommand` 改为遍历平台表
- [ ] `bin/cli.js`：`list` 与 `--help` 输出补充平台安装目标信息
- [ ] `__tests__/cli.test.js`：补 dsh 目标断言（`getHome()` 已读 `process.env.HOME`，可注入测试）
- [ ] `CLAUDE.md`：架构一节更新为双平台描述
- [ ] 文档站 `docs/guide/`：CLI 安装说明同步双平台行为（可由 docs-sync 技能跟进）
- [ ] dsh 侧验收：`node bin/cli.js install` 后确认 `~/.dsh/skills/<name>/SKILL.md` 存在且 dsh 会话中技能可被识别调用
