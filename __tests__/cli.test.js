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

  it('SKILL.md 包含正确内容', async () => {
    const { getPackageDir } = await import('../bin/cli.js')
    const pkgDir = getPackageDir()
    const path = join(pkgDir, 'skills', 'vitepress-doc-site', 'SKILL.md')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('VitePress')
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
    const targetFile = join(targetDir, 'skill:vitepress-doc-site.md')
    expect(existsSync(targetFile)).toBe(true)
  })
})
