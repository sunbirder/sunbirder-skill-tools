# DeepSeek Harness 平台支持 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bin/cli.js` 从单平台（Claude Code）升级为多平台安装：默认安装到所有"存在"的平台（目录存在判定），`--platform claude|dsh` 可指向单一平台，平台不存在则跳过。

**Architecture:** 引入 `PLATFORMS` 平台表（单一事实来源）与 `resolveTargetPlatforms()` 存在性解析；`installSkill`/`installCommand` 接收解析后的 targets 并按平台写入；`main()` 参数解析摘出 `--platform`。技能文件内容零改动——dsh 与 Claude Code 的 SKILL.md 格式完全兼容。

**Tech Stack:** JavaScript (ESM, Node >= 18)、Jest（`node --experimental-vm-modules`）、Markdown。

**Spec:** `docs/superpowers/specs/2026-09-13-dsh-platform-support-design.md`（已批准）

## Global Constraints

- 纯 JavaScript ESM，无 TypeScript（`bin/cli.js` 是 `"type": "module"` 下的 ESM）
- 所有用户文本（CLI 输出、注释、文档）使用中文
- 技能目录命名 kebab-case
- Node >= 18（`package.json` engines）
- 测试命令：`npm test`（即 `node --experimental-vm-modules node_modules/.bin/jest`）
- 测试隔离方式：`process.env.HOME` 注入 `mkdtempSync` 临时目录；`process.exit` 替换为 `jest.fn()`（替换后 `exit` 不真退出，故每个 exit 调用点之后必须紧跟 `return`）
- ESM 模块在测试内重复 `import` 返回同一缓存实例，`HOME` 必须在**函数调用时**读取（现有 `getHome()` 已满足，新代码同样不得在模块顶层读 `HOME`）
- 提交信息风格：中文 Conventional Commits（参考 `git log`：`feat(cli): ...`、`docs: ...`）

---

### Task 1: `PLATFORMS` 平台表 + `resolveTargetPlatforms()` 存在性解析

**Files:**
- Modify: `bin/cli.js`（在 `getCommandsTarget()` 之后、`SKILL_LIST` 之前插入新代码；本任务暂不删除旧函数）
- Test: `__tests__/cli.test.js`（文件顶部 import 增加 `mkdirSync`；文件末尾追加新 describe）

**Interfaces:**
- Consumes: 现有 `getHome()`（调用时读 `process.env.HOME`）
- Produces: `PLATFORMS`（数组，元素形状 `{ id: string, home: string, commands: boolean }`）；`resolveTargetPlatforms(platformArg?: string)` → `{ targets: Array<{id, home, commands}>, skipped: Array<{id: string, homeDir: string}> }`。后续所有任务依赖这两个名字与形状。

- [ ] **Step 1: 写失败测试**

在 `__tests__/cli.test.js` 顶部修改 import：

```js
import { mkdtempSync, readFileSync, existsSync, mkdirSync } from 'fs'
```

在文件末尾追加：

```js
describe('resolveTargetPlatforms', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  it('双目录存在 → 返回双平台', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    const { targets, skipped } = resolveTargetPlatforms()
    expect(targets.map(p => p.id)).toEqual(['claude', 'dsh'])
    expect(skipped).toEqual([])
  })

  it('仅 .claude 存在 → 仅 claude，dsh 进 skipped', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    const { targets, skipped } = resolveTargetPlatforms()
    expect(targets.map(p => p.id)).toEqual(['claude'])
    expect(skipped).toEqual([{ id: 'dsh', homeDir: join(tmpDir, '.dsh') }])
  })

  it('仅 .dsh 存在 → 仅 dsh', async () => {
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    const { targets } = resolveTargetPlatforms()
    expect(targets.map(p => p.id)).toEqual(['dsh'])
  })

  it('目录都不存在 → 空目标，全部进 skipped', async () => {
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    const { targets, skipped } = resolveTargetPlatforms()
    expect(targets).toEqual([])
    expect(skipped.map(s => s.id)).toEqual(['claude', 'dsh'])
  })

  it('--platform dsh 指定但目录不存在 → 同样跳过（不强制创建）', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    const { targets } = resolveTargetPlatforms('dsh')
    expect(targets).toEqual([])
  })

  it('未知平台名 → 报错并 exit(1)', async () => {
    const { resolveTargetPlatforms } = await import('../bin/cli.js')
    resolveTargetPlatforms('codex')
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- resolveTargetPlatforms`
Expected: FAIL —— `TypeError: resolveTargetPlatforms is not a function`（或 import 解构为 undefined）

- [ ] **Step 3: 最小实现**

在 `bin/cli.js` 的 `getCommandsTarget()` 函数之后插入（`SKILL_LIST` 之前）：

```js
// 平台表 — 单一事实来源；未来加平台 = 数组加一项
// dsh 技能格式与 Claude Code 完全兼容（<name>/SKILL.md），且 dsh 技能即斜杠命令，无命令目录
const PLATFORMS = [
  { id: 'claude', home: '.claude', commands: true },  // 技能 + 命令
  { id: 'dsh', home: '.dsh', commands: false },       // 仅技能
]

// 解析安装目标平台：platformArg 为空 → 遍历平台表按目录存在性过滤；
// 指定平台 → 同样过存在性检查（不存在则跳过，不强制创建）；未知平台名 → 报错退出
function resolveTargetPlatforms(platformArg) {
  const selected = platformArg
    ? PLATFORMS.filter(p => p.id === platformArg)
    : PLATFORMS
  if (platformArg && selected.length === 0) {
    console.error(`错误：未知平台 "${platformArg}"，可选值：${PLATFORMS.map(p => p.id).join(' | ')}`)
    process.exit(1)
    return { targets: [], skipped: [] }
  }
  const targets = []
  const skipped = []
  for (const p of selected) {
    const homeDir = join(getHome(), p.home)
    if (existsSync(homeDir)) {
      targets.push(p)
    } else {
      skipped.push({ id: p.id, homeDir })
    }
  }
  return { targets, skipped }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test -- resolveTargetPlatforms`
Expected: PASS（6 个用例全绿）

- [ ] **Step 5: 提交**

```bash
git add bin/cli.js __tests__/cli.test.js
git commit -m "feat(cli): 平台表与目标解析 — 目录存在性门控"
```

---

### Task 2: `installSkill` / `installCommand` 多平台写入

**Files:**
- Modify: `bin/cli.js:109-150`（`installSkill`、`installCommand` 重写；`getSkillsTarget`/`getCommandsTarget` 本任务暂保留，Task 4 删除）
- Test: `__tests__/cli.test.js`（现有 `CLI installSkill` 与 `CLI upgradeAll` 两个 describe 的 `beforeEach` 各加一行 mkdir；文件末尾追加新 describe；顶部 import 增加 `writeFileSync`）

**Interfaces:**
- Consumes: Task 1 的 `PLATFORMS` 元素形状 `{ id, home, commands }`；现有 `getPackageDir()`
- Produces: `installSkill(skillName: string, targets?: Platform[])`、`installCommand(commandName: string, targets?: Platform[])`——`targets` 缺省时在**调用时**用 `resolveTargetPlatforms().targets` 兜底解析（保证旧调用点与现有测试兼容）。写入行格式 `  [<平台id>] ✓ 已安装技能: <name>`。

- [ ] **Step 1: 更新现有测试夹具 + 写失败测试**

(a) 现有测试兼容性修正——`CLI installSkill` 和 `CLI upgradeAll` 两个 describe 的 `beforeEach` 中，`process.env.HOME = tmpDir` 之后各加一行（原因：目标解析现在以"目录存在"为门，空 HOME 会解析出零目标导致安装不了任何东西；建出 `.claude` 即模拟"装了 Claude Code 的机器"）：

```js
  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    process.exit = jest.fn()
  })
```

(b) 顶部 import 改为：

```js
import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
```

(c) 文件末尾追加新 describe：

```js
describe('CLI 多平台安装', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  function prepareBothPlatforms() {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
  }

  it('双平台存在 → 技能写入两边', async () => {
    prepareBothPlatforms()
    const { installSkill } = await import('../bin/cli.js')
    installSkill('discuss')
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
  })

  it('命令只写入 claude，dsh 不产生 commands 目录', async () => {
    prepareBothPlatforms()
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:discuss')
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'discuss.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.dsh', 'commands'))).toBe(false)
  })

  it('dsh 目录不存在 → 默认只写 claude，且不创建 .dsh', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    const { installSkill } = await import('../bin/cli.js')
    installSkill('discuss')
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.dsh'))).toBe(false)
  })

  it('显式传入 targets 时不再做存在性解析', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('discuss', [{ id: 'dsh', home: '.dsh', commands: false }])
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
  })

  it('单平台写入失败 → 警告继续，不抛异常', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    // 在 skills 目录位置放一个文件，迫使 mkdirSync 失败
    writeFileSync(join(tmpDir, '.claude', 'skills'), 'blocker')
    const { installSkill } = await import('../bin/cli.js')
    expect(() => installSkill('discuss')).not.toThrow()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- "CLI 多平台安装"`
Expected: FAIL —— 新用例中技能只写入了 `.claude`（现有 `installSkill` 不认识 dsh），"技能写入两边"等断言不成立；另外现有 12 个 install 用例此时也会因夹具加了 mkdir 但旧实现仍写 `getSkillsTarget()` 而保持 PASS（旧实现不依赖存在性门控，属预期）。

- [ ] **Step 3: 重写 `installSkill` 与 `installCommand`**

用以下实现整体替换 `bin/cli.js` 中现有的 `installSkill`（109-127 行）和 `installCommand`（129-150 行）：

```js
function installSkill(skillName, targets = resolveTargetPlatforms().targets) {
  const pkgDir = getPackageDir()
  const src = join(pkgDir, 'skills', skillName)

  if (!existsSync(src)) {
    console.error(`错误：技能 "${skillName}" 不存在`)
    process.exit(1)
    return
  }

  for (const platform of targets) {
    const dest = join(getHome(), platform.home, 'skills', skillName)
    try {
      mkdirSync(dest, { recursive: true })
      const skillFile = join(src, 'SKILL.md')
      if (existsSync(skillFile)) {
        writeFileSync(join(dest, 'SKILL.md'), readFileSync(skillFile))
        console.log(`  [${platform.id}] ✓ 已安装技能: ${skillName}`)
      }
    } catch (err) {
      console.warn(`  [${platform.id}] ⚠ 写入失败，已跳过该平台: ${err.message}`)
    }
  }
}

function installCommand(commandName, targets = resolveTargetPlatforms().targets) {
  const pkgDir = getPackageDir()
  // commandName 格式: "category:name"，文件路径: commands/category/name.md
  const parts = commandName.split(':')
  const srcPath = parts.length > 1
    ? join(pkgDir, 'commands', parts[0], `${parts[1]}.md`)
    : join(pkgDir, 'commands', `${commandName}.md`)

  if (!existsSync(srcPath)) {
    console.error(`错误：命令 "${commandName}" 不存在`)
    process.exit(1)
    return
  }

  for (const platform of targets) {
    if (!platform.commands) continue // dsh 技能即命令，无命令目录
    const destDir = parts.length > 1
      ? join(getHome(), platform.home, 'commands', parts[0])
      : join(getHome(), platform.home, 'commands')
    const destName = parts.length > 1 ? parts[parts.length - 1] : commandName
    try {
      mkdirSync(destDir, { recursive: true })
      writeFileSync(join(destDir, `${destName}.md`), readFileSync(srcPath))
      console.log(`  [${platform.id}] ✓ 已安装命令: /${commandName}`)
    } catch (err) {
      console.warn(`  [${platform.id}] ⚠ 写入失败，已跳过该平台: ${err.message}`)
    }
  }
}
```

注意两点保持现状（spec §5）：源技能/命令目录不存在仍是 fail-fast `process.exit(1)`；`SKILL.md` 缺失时静默跳过该文件（原行为）。

- [ ] **Step 4: 运行全部测试确认通过**

Run: `npm test`
Expected: PASS —— 新用例 5 个全绿，现有用例（文件完整性、loadSkills、loadCommands、CLI installSkill 12 个、CLI upgradeAll）不受影响

- [ ] **Step 5: 提交**

```bash
git add bin/cli.js __tests__/cli.test.js
git commit -m "feat(cli): installSkill/installCommand 多平台写入"
```

---

### Task 3: `installAll` / `upgradeAll` / `installSkillByName` / `main` 接线 `--platform`

**Files:**
- Modify: `bin/cli.js`（`upgradeAll` 152-169 行、`installAll` 171-185 行、`showHelp` 199 行附近的用法文本暂不动（Task 4）、`main` 218-263 行、`installSkillByName` 265-278 行、末尾 `export` 语句）
- Test: `__tests__/cli.test.js`（文件末尾追加两个 describe）

**Interfaces:**
- Consumes: Task 1 `resolveTargetPlatforms(platformArg)` → `{ targets, skipped }`；Task 2 `installSkill(skillName, targets)` / `installCommand(commandName, targets)`
- Produces: `installAll(platformArg?: string)`、`upgradeAll(platformArg?: string)`、`installSkillByName(skillName: string, platformArg?: string)`、`extractPlatform(args: string[])` → `{ args: string[], platformArg: string | undefined }`、`main(argv: string[])`（新增导出）。零安装（targets 为空）→ 打印"未安装任何内容"并 `process.exit(1)`。

- [ ] **Step 1: 写失败测试**

文件末尾追加：

```js
describe('CLI installAll 平台接线', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  it('仅 .claude 存在 → 技能命令写入 claude，不创建 .dsh', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    const { installAll } = await import('../bin/cli.js')
    installAll()
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'disk-clean', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'disk-clean.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.dsh'))).toBe(false)
    expect(process.exit).not.toHaveBeenCalled()
  })

  it('双平台存在 → dsh 有技能无命令', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { installAll } = await import('../bin/cli.js')
    installAll()
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'disk-clean', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.dsh', 'commands'))).toBe(false)
  })

  it('目录都不存在 → exit(1)，不创建任何目录', async () => {
    const { installAll } = await import('../bin/cli.js')
    installAll()
    expect(process.exit).toHaveBeenCalledWith(1)
    expect(existsSync(join(tmpDir, '.claude'))).toBe(false)
    expect(existsSync(join(tmpDir, '.dsh'))).toBe(false)
  })

  it('--platform dsh 只装 dsh，不碰 claude', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { installAll } = await import('../bin/cli.js')
    installAll('dsh')
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'skills'))).toBe(false)
  })
})

describe('CLI main 参数解析', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  it('extractPlatform 摘出 --platform 及其值', async () => {
    const { extractPlatform } = await import('../bin/cli.js')
    const { args, platformArg } = extractPlatform(['install', '--platform', 'dsh'])
    expect(args).toEqual(['install'])
    expect(platformArg).toBe('dsh')
  })

  it('无 --platform 时原样返回', async () => {
    const { extractPlatform } = await import('../bin/cli.js')
    const { args, platformArg } = extractPlatform(['install'])
    expect(args).toEqual(['install'])
    expect(platformArg).toBeUndefined()
  })

  it('main: install --platform dsh → 技能进 dsh', async () => {
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { main } = await import('../bin/cli.js')
    main(['node', 'cli', 'install', '--platform', 'dsh'])
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
  })

  it('main: add <skill> --platform dsh → 指定技能进 dsh', async () => {
    mkdirSync(join(tmpDir, '.dsh'), { recursive: true })
    const { main } = await import('../bin/cli.js')
    main(['node', 'cli', 'add', 'disk-clean', '--platform', 'dsh'])
    expect(existsSync(join(tmpDir, '.dsh', 'skills', 'disk-clean', 'SKILL.md'))).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- "CLI installAll 平台接线" "CLI main 参数解析"`
Expected: FAIL —— `main` 未导出（import undefined）、`extractPlatform` 不存在；"目录都不存在"用例中 `installAll()` 现在会照常安装到默认 claude 路径（不 exit）。

- [ ] **Step 3: 实现接线**

(a) 用以下实现替换 `bin/cli.js` 现有 `upgradeAll`（152-169 行）与 `installAll`（171-185 行）：

```js
function upgradeAll(platformArg) {
  const pkgDir = getPackageDir()
  const gitDir = join(pkgDir, '.git')

  if (existsSync(gitDir)) {
    console.log('拉取最新代码...')
    try {
      execSync('git pull', { cwd: pkgDir, stdio: 'inherit' })
    } catch {
      console.log('git pull 失败，使用当前代码继续安装')
    }
  } else {
    console.log('非 git 仓库，跳过拉取，直接重新安装')
  }

  console.log('')
  installAll(platformArg)
}

function installAll(platformArg) {
  const { targets, skipped } = resolveTargetPlatforms(platformArg)

  if (targets.length === 0) {
    console.error('未安装任何内容：未检测到已存在的平台目录')
    for (const s of skipped) {
      console.error(`  跳过 ${s.id}（${s.homeDir} 不存在）`)
    }
    process.exit(1)
    return
  }

  console.log('安装 sunbirder-skill-tools...\n')

  console.log('[Skills]')
  for (const skill of loadSkills()) {
    installSkill(skill.name, targets)
  }

  console.log('\n[Commands]')
  for (const cmd of loadCommands()) {
    installCommand(cmd.name, targets)
  }

  console.log('\n安装完成！')
  for (const p of targets) {
    const extra = p.commands ? ` + ${loadCommands().length} 个命令` : ''
    console.log(`  [${p.id}] ✓ ${loadSkills().length} 个技能${extra}`)
  }
}
```

(b) 在 `main` 之前新增 `extractPlatform`，并重写 `main` 与 `installSkillByName`：

```js
// 从参数中摘出 --platform <id>，返回剩余位置参数与平台参数
function extractPlatform(args) {
  const idx = args.indexOf('--platform')
  if (idx === -1) return { args, platformArg: undefined }
  return {
    args: args.slice(0, idx).concat(args.slice(idx + 2)),
    platformArg: args[idx + 1],
  }
}

function main(argv) {
  const { args, platformArg } = extractPlatform(argv.slice(2))

  if (args.length === 0) {
    showHelp()
    process.exit(0)
  }

  const arg = args[0]
  const target = args[1]

  switch (arg) {
    case 'install':
    case '--all':
      installAll(platformArg)
      break
    case 'upgrade':
      upgradeAll(platformArg)
      break
    case 'add':
      if (!target) {
        console.error('错误：请指定要安装的技能名称')
        listSkills()
        process.exit(1)
        return
      }
      installSkillByName(target, platformArg)
      break
    case 'list':
    case '--list':
      listSkills()
      break
    case '--help':
      showHelp()
      break
    default:
      // 尝试将 arg 当作技能名安装
      if (!arg.startsWith('--')) {
        installSkillByName(arg, platformArg)
      } else {
        console.error(`错误：未知选项 "${arg}"`)
        console.error('使用 list 查看可用技能，或 --help 查看帮助')
        process.exit(1)
      }
      break
  }
}

function installSkillByName(skillName, platformArg) {
  const { targets } = resolveTargetPlatforms(platformArg)
  if (targets.length === 0) {
    console.error('未安装任何内容：未检测到已存在的平台目录')
    process.exit(1)
    return
  }
  const skillNames = loadSkills().map(s => s.name)
  const cmdNames = loadCommands().map(c => c.name)
  if (skillNames.includes(skillName)) {
    installSkill(skillName, targets)
    // 同时安装对应命令
    const cmd = cmdNames.find(c => c.includes(skillName))
    if (cmd) installCommand(cmd, targets)
  } else {
    console.error(`错误：未知技能 "${skillName}"`)
    console.error('使用 list 查看可用技能')
    process.exit(1)
  }
}
```

(c) 末尾导出语句改为：

```js
// 导出函数供测试使用
export { loadSkills, loadCommands, installSkill, installCommand, installAll, upgradeAll, getPackageDir, resolveTargetPlatforms, extractPlatform, PLATFORMS, main }
```

- [ ] **Step 4: 运行全部测试确认通过**

Run: `npm test`
Expected: PASS —— 全部用例绿（含 Task 1/2 的用例与现有用例）

- [ ] **Step 5: 提交**

```bash
git add bin/cli.js __tests__/cli.test.js
git commit -m "feat(cli): install/upgrade/add 接线 --platform 与零安装退出码"
```

---

### Task 4: `list`/`--help` 平台展示 + 移除废弃的单平台目标函数

**Files:**
- Modify: `bin/cli.js`（`listSkills` 187-196 行、`showHelp` 198-216 行、删除 `getSkillsTarget` 17-19 行与 `getCommandsTarget` 21-23 行）
- Test: `__tests__/cli.test.js`（文件末尾追加一个 describe）

**Interfaces:**
- Consumes: Task 1 的 `PLATFORMS`
- Produces: `listSkills()` 输出以"安装目标"块开头（每平台一行 `[<id>] <homeDir> ✓|✗（未检测到）`，dsh 行附"（仅技能）"）；`showHelp()` 用法行含 `[--platform claude|dsh]`。无新导出。

- [ ] **Step 1: 写失败测试**

文件末尾追加：

```js
describe('CLI listSkills 平台展示', () => {
  let tmpDir
  let logSpy

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.HOME = realHome
    logSpy.mockRestore()
  })

  it('输出平台目标列表（含 claude 与 dsh）', async () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    const { listSkills } = await import('../bin/cli.js')
    listSkills()
    const out = logSpy.mock.calls.map(c => c.join(' ')).join('\n')
    expect(out).toContain('安装目标')
    expect(out).toContain('[claude]')
    expect(out).toContain('[dsh]')
    expect(out).toContain('仅技能')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- "CLI listSkills 平台展示"`
Expected: FAIL —— 现有 `listSkills` 不输出"安装目标"块

- [ ] **Step 3: 实现展示 + 清理废弃函数**

(a) 用以下实现替换现有 `listSkills`：

```js
function listSkills() {
  console.log('安装目标：\n')
  for (const p of PLATFORMS) {
    const homeDir = join(getHome(), p.home)
    const status = existsSync(homeDir) ? '✓' : '✗（未检测到）'
    console.log(`  [${p.id}] ${homeDir} ${status}${p.commands ? '' : '（仅技能）'}`)
  }
  console.log('\n可用技能：\n')
  for (const skill of loadSkills()) {
    console.log(`  ${skill.name.padEnd(30)} ${skill.description}`)
  }
  console.log('\n可用命令：\n')
  for (const cmd of loadCommands()) {
    console.log(`  /${cmd.name.padEnd(30)} ${cmd.description}`)
  }
}
```

(b) `showHelp` 中的用法块替换为：

```js
  console.log(`sunbirder-skills — 个人技能工具集（Claude Code + DeepSeek Harness）

用法:
  sunbirder-skills install [--platform claude|dsh]      安装全部技能和命令
  sunbirder-skills upgrade [--platform claude|dsh]      拉取最新代码并重新安装
  sunbirder-skills add <skill> [--platform claude|dsh]  安装指定技能
  sunbirder-skills list              列出可用技能与安装目标

说明:
  默认安装到所有检测到的平台（按 home 目录是否存在判定）；
  --platform 可指定单一平台，但目标平台不存在时同样跳过。

快捷方式（兼容旧版）:
  sunbirder-skills --all             等同于 install
  sunbirder-skills --list            等同于 list
  sunbirder-skills <skill>           等同于 add <skill>

npx 安装:
  npx sunbirder/sunbirder-skill-tools install
  npx sunbirder/sunbirder-skill-tools upgrade
  npx sunbirder/sunbirder-skill-tools add vitepress-doc-site`)
```

(c) 删除 `getSkillsTarget`（17-19 行）与 `getCommandsTarget`（21-23 行）两个函数——重构后已无调用点。删除后运行确认：

Run: `grep -n "getSkillsTarget\|getCommandsTarget" bin/cli.js __tests__/cli.test.js`
Expected: 无任何输出（零引用）

- [ ] **Step 4: 运行全部测试确认通过**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add bin/cli.js __tests__/cli.test.js
git commit -m "feat(cli): list/help 展示平台目标，移除废弃的单平台目标函数"
```

---

### Task 5: 文档同步 + 真机验收

**Files:**
- Modify: `CLAUDE.md`（架构一节）
- Modify: `README.md`（安装、使用、命令行用法章节）
- Modify: `docs/guide/index.md`（安装、管理章节）
- 无代码改动，本任务以文档正确性 + 真机验收为准

**Interfaces:**
- Consumes: Task 1-4 完成后的 CLI 行为
- Produces: 与实际行为一致的文档

- [ ] **Step 1: 更新 CLAUDE.md 架构一节**

将 CLAUDE.md 中架构一节整体替换为：

```markdown
## 架构

- `bin/cli.js` — CLI 入口，多平台安装：默认安装到所有检测到的平台（按 home 目录存在判定），`--platform claude|dsh` 可指定单一平台
  - Claude Code：技能 → `~/.claude/skills/`，命令 → `~/.claude/commands/`
  - DeepSeek Harness：技能 → `~/.dsh/skills/`（dsh 技能即斜杠命令，无命令目录）
- `skills/` — 技能定义（Markdown + YAML frontmatter），格式与两个平台兼容，无需按平台区分
- `commands/` — 斜杠命令（Markdown + YAML frontmatter，仅 Claude Code 使用）
- `docs/` — VitePress 文档站点
```

- [ ] **Step 2: 更新 README.md**

(a) 开头简介（第 3 行）替换为：

```markdown
个人技能工具集，支持 Claude Code 与 DeepSeek Harness 双平台，可通过 `npx` 或 `git clone` 安装到任意机器。
```

(b) "安装"章节末尾追加平台说明：

```markdown
### 平台说明

- 默认安装到所有检测到的平台（按 `~/.claude` / `~/.dsh` 目录是否存在判定），平台不存在则自动跳过
- `--platform claude|dsh` 可指定单一平台（目标平台不存在时同样跳过）
- Claude Code：技能装到 `~/.claude/skills/`，斜杠命令装到 `~/.claude/commands/`
- DeepSeek Harness：技能装到 `~/.dsh/skills/`（dsh 中技能即斜杠命令，无需单独的命令目录）
```

(c) "命令行用法"章节代码块替换为：

```bash
sunbirder-skills install [--platform claude|dsh]      # 安装全部技能
sunbirder-skills upgrade [--platform claude|dsh]      # 拉取最新代码并重新安装
sunbirder-skills add <name> [--platform claude|dsh]   # 安装指定技能
sunbirder-skills list                                 # 列出可用技能与安装目标
```

- [ ] **Step 3: 更新 docs/guide/index.md**

(a) "安装"章节代码块后追加：

```markdown
### 平台说明

默认安装到所有检测到的平台（`~/.claude` 或 `~/.dsh` 存在即认为该平台已安装）；
`--platform claude|dsh` 可指定单一平台。DeepSeek Harness 侧技能装到 `~/.dsh/skills/`，
dsh 中技能即斜杠命令，无需安装命令文件。
```

(b) "管理"章节代码块替换为：

```bash
sunbirder-skills --list                              # 查看已安装的技能与安装目标
sunbirder-skills --all                               # 重新安装全部技能（覆盖更新）
sunbirder-skills vitepress-doc-site                  # 安装指定技能
sunbirder-skills install --platform dsh              # 只安装到 DeepSeek Harness
```

- [ ] **Step 4: 真机验收（spec §8）**

Run: `node bin/cli.js install && ls ~/.dsh/skills/`
Expected: 输出同时包含 `[claude]` 与 `[dsh]` 前缀的安装行；`~/.dsh/skills/` 下出现 8 个技能目录（vitepress-doc-site、discuss、docs-sync、doc-gen、docs-all-in-one、self-upgrade、wxapkg-unpack、disk-clean），每个含 `SKILL.md`；且 `~/.dsh/commands` 不存在。

Run: `node bin/cli.js list`
Expected: 首块输出"安装目标"，两行平台状态均为 `✓`

（dsh 会话内技能可被识别调用的最终确认，需要用户在 dsh 中实际使用后反馈，不属于本自动化验收步骤。）

- [ ] **Step 5: 运行全部测试 + 提交**

Run: `npm test`
Expected: PASS

```bash
git add CLAUDE.md README.md docs/guide/index.md
git commit -m "docs: 双平台安装说明同步（CLAUDE.md/README/guide）"
```

---

## 自审记录

- **Spec 覆盖**：§2 行为模型 → Task 1（存在性门控/--platform 同门）/3（零安装退出码）/4（list/help 展示）；§3 架构 → Task 1-4；§4 数据流 → Task 2/3 落位断言；§5 错误处理四行 → Task 1（跳过/未知平台）、Task 2（源缺失 fail-fast 保持、写失败警告继续）、Task 3（零安装 exit 1）；§6 测试策略 → 各 Task 测试代码；§8 真机验收 → Task 5 Step 4。无缺口。
- **占位符扫描**：无 TBD/TODO/"适当处理"类表述；所有代码步骤给出完整代码。
- **类型一致性**：`PLATFORMS` 元素 `{ id, home, commands }`、`resolveTargetPlatforms` 返回 `{ targets, skipped }`（skipped 元素 `{ id, homeDir }`）、`extractPlatform` 返回 `{ args, platformArg }`、`installAll/upgradeAll` 收 `platformArg` 而 `installSkill/installCommand` 收 `targets`——各任务签名一致。
