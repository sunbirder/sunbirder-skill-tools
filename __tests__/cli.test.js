import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { jest } from '@jest/globals'

// These can be statically imported as they don't modify globals
const realHome = process.env.HOME
const realExit = process.exit

describe('文件完整性', () => {
  it('skills/vitepress-doc-site/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'vitepress-doc-site', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/vitepress-doc-site.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'vitepress-doc-site.md')
    expect(existsSync(path)).toBe(true)
  })

  it('skills/discuss/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'discuss', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/discuss.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'discuss.md')
    expect(existsSync(path)).toBe(true)
  })

  it('discuss SKILL.md 包含正确内容', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'discuss', 'SKILL.md')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('方案讨论')
  })

  it('skills/docs-sync/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'docs-sync', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/docs-sync.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'docs-sync.md')
    expect(existsSync(path)).toBe(true)
  })

  it('skills/doc-gen/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'doc-gen', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/doc-gen.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'doc-gen.md')
    expect(existsSync(path)).toBe(true)
  })

  it('skills/docs-all-in-one/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'docs-all-in-one', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('skills/sidebar-sync/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'sidebar-sync', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/sidebar-sync.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'sidebar-sync.md')
    expect(existsSync(path)).toBe(true)
  })

  it('sidebar-sync SKILL.md 包含侧边栏同步内容', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'sidebar-sync', 'SKILL.md')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('侧边栏')
    expect(content).toContain('死链')
  })

  it('commands/skill/docs-all-in-one.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'docs-all-in-one.md')
    expect(existsSync(path)).toBe(true)
  })

  it('docs-all-in-one SKILL.md 组合 doc-gen 与 vitepress-doc-site', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'docs-all-in-one', 'SKILL.md')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('doc-gen')
    expect(content).toContain('vitepress-doc-site')
    expect(content).toContain('一站式')
  })

  it('skills/self-upgrade/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'self-upgrade', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/self-upgrade.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'self-upgrade.md')
    expect(existsSync(path)).toBe(true)
  })

  it('skills/wxapkg-unpack/SKILL.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'wxapkg-unpack', 'SKILL.md')
    expect(existsSync(path)).toBe(true)
  })

  it('commands/skill/wxapkg-unpack.md 存在', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'commands', 'skill', 'wxapkg-unpack.md')
    expect(existsSync(path)).toBe(true)
  })

  it('wxapkg-unpack SKILL.md 包含解密原理', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'wxapkg-unpack', 'SKILL.md')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('V1MMWX')
    expect(content).toContain('saltiest')
  })
})

describe('loadSkills', () => {
  it('返回技能列表', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    expect(skills.length).toBeGreaterThan(0)
    expect(skills[0]).toHaveProperty('name')
    expect(skills[0]).toHaveProperty('description')
  })

  it('包含 vitepress-doc-site', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('vitepress-doc-site')
  })

  it('包含 discuss', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('discuss')
  })

  it('包含 docs-sync', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('docs-sync')
  })

  it('包含 doc-gen', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('doc-gen')
  })

  it('包含 docs-all-in-one', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('docs-all-in-one')
  })

  it('包含 sidebar-sync', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('sidebar-sync')
  })

  it('包含 self-upgrade', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('self-upgrade')
  })

  it('包含 wxapkg-unpack', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('wxapkg-unpack')
  })
})

describe('loadCommands', () => {
  it('返回命令列表', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    expect(commands.length).toBeGreaterThan(0)
    expect(commands[0]).toHaveProperty('name')
    expect(commands[0]).toHaveProperty('description')
  })

  it('包含 skill:vitepress-doc-site', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:vitepress-doc-site')
  })

  it('包含 skill:discuss', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:discuss')
  })

  it('包含 skill:docs-sync', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:docs-sync')
  })

  it('包含 skill:doc-gen', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:doc-gen')
  })

  it('包含 skill:docs-all-in-one', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:docs-all-in-one')
  })

  it('包含 skill:sidebar-sync', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:sidebar-sync')
  })

  it('包含 skill:self-upgrade', async () => {
    const { loadCommands } = await import('../bin/cli.js')
    const commands = loadCommands()
    const names = commands.map(c => c.name)
    expect(names).toContain('skill:self-upgrade')
  })
})

describe('CLI installSkill', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  it('安装技能到 ~/.claude/skills/', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('vitepress-doc-site')

    const targetFile = join(tmpDir, '.claude', 'skills', 'vitepress-doc-site', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('VitePress')
  })

  it('安装命令到 ~/.claude/commands/', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:vitepress-doc-site')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'vitepress-doc-site.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 discuss 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('discuss')

    const targetFile = join(tmpDir, '.claude', 'skills', 'discuss', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('方案讨论')
  })

  it('安装 discuss 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:discuss')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'discuss.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 docs-sync 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('docs-sync')

    const targetFile = join(tmpDir, '.claude', 'skills', 'docs-sync', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('文档同步')
  })

  it('安装 docs-sync 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:docs-sync')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'docs-sync.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 doc-gen 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('doc-gen')

    const targetFile = join(tmpDir, '.claude', 'skills', 'doc-gen', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('项目文档生成')
  })

  it('安装 doc-gen 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:doc-gen')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'doc-gen.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 docs-all-in-one 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('docs-all-in-one')

    const targetFile = join(tmpDir, '.claude', 'skills', 'docs-all-in-one', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('一站式')
  })

  it('安装 docs-all-in-one 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:docs-all-in-one')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'docs-all-in-one.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 sidebar-sync 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('sidebar-sync')

    const targetFile = join(tmpDir, '.claude', 'skills', 'sidebar-sync', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('侧边栏')
  })

  it('安装 sidebar-sync 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:sidebar-sync')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'sidebar-sync.md')
    expect(existsSync(targetFile)).toBe(true)
  })

  it('安装 self-upgrade 技能', async () => {
    const { installSkill } = await import('../bin/cli.js')
    installSkill('self-upgrade')

    const targetFile = join(tmpDir, '.claude', 'skills', 'self-upgrade', 'SKILL.md')
    expect(existsSync(targetFile)).toBe(true)

    const content = readFileSync(targetFile, 'utf8')
    expect(content).toContain('自升级')
  })

  it('安装 self-upgrade 命令', async () => {
    const { installCommand } = await import('../bin/cli.js')
    installCommand('skill:self-upgrade')

    const targetDir = join(tmpDir, '.claude', 'commands', 'skill')
    const targetFile = join(targetDir, 'self-upgrade.md')
    expect(existsSync(targetFile)).toBe(true)
  })
})

describe('CLI upgradeAll', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'sunbirder-test-'))
    process.env.HOME = tmpDir
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    process.exit = jest.fn()
  })

  afterEach(() => {
    process.env.HOME = realHome
    process.exit = realExit
  })

  it('upgrade 重新安装全部技能和命令', async () => {
    const { upgradeAll } = await import('../bin/cli.js')
    upgradeAll()

    // 验证技能文件
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'vitepress-doc-site', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'discuss', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'docs-sync', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'skills', 'doc-gen', 'SKILL.md'))).toBe(true)

    // 验证命令文件
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'vitepress-doc-site.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'discuss.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'docs-sync.md'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'skill', 'doc-gen.md'))).toBe(true)
  })
})

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
