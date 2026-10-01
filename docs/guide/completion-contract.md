# completion-contract

生成完成契约(Completion Contract)— 开工前把「什么叫做完」钉成 Hermes 五字段事前验收协议,验收**只认命令的真实输出,不认口头宣称**。语义源自 Hermes Agent v0.18(Judgment Release)。

## 触发条件

- 输入 `/skill:completion-contract`
- 说「生成完成契约」「Completion Contract」「钉一份验收协议」
- 一项多步实施工作开工前,需要可执行命令级的完成判定与停止条件

## 解决的问题

| 传统痛点 | 契约如何解决 |
|---------|-------------|
| Agent「感觉做完了」就收工 | `verification` 规定裁判必须真实执行命令、拿输出当证据 |
| 范围越做越大、死循环 | `stop_when` 规定可判定的暂停条件,触发即停下问人 |
| 实施时改坏不相关的东西 | `constraints` + `boundaries` 钉死红线与作用域 |
| 验收时各说各话 | `outcome` 写最终可观测状态,判定规则唯一 |

## 五字段

| 字段 | 含义 |
|------|------|
| `outcome` | 最终必须达成的可观测状态(结果,非过程) |
| `verification` | **灵魂**:验证命令 + 通过标准,真实执行拿输出当证据 |
| `constraints` | 过程中不得破坏的纪律/规范/兼容性 |
| `boundaries` | 允许写/不允许写的具体路径 |
| `stop_when` | 触发即暂停问人的可判定条件(≥2 条) |

## 流程

1. **确认目标与 slug** — 一句话目标;契约落盘 `.scratch/<slug>/completion-contract.md`
2. **实地勘察** — 为 verification 找真实可执行命令(构建/测试/启动/检查脚本入口);禁止编造,核不出转 stop_when
3. **逐字段起草** — 按质量红线(outcome 写状态不写清单、boundaries 具体到路径……详见 SKILL.md)
4. **用户确认后落盘** — 实施期间修订必须经用户裁定

完整质量红线、常见错误表与输出模板见 `skills/completion-contract/SKILL.md`。
