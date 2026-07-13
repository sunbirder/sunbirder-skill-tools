import { mkdtempSync, readFileSync, existsSync } from 'fs'
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

  it('包含 self-upgrade', async () => {
    const { loadSkills } = await import('../bin/cli.js')
    const skills = loadSkills()
    const names = skills.map(s => s.name)
    expect(names).toContain('self-upgrade')
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
