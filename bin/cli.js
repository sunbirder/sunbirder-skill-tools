#!/usr/bin/env node

// sunbirder-skill-tools CLI
// 将技能 Markdown 文件和斜杠命令安装到 Claude Code 目录

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getHome() {
  return process.env.HOME || process.env.USERPROFILE
}

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

// 技能列表
const SKILL_LIST = [
  {
    name: 'vitepress-doc-site',
    description: '将 Markdown 文件搭建为 VitePress 文档网站',
  },
  {
    name: 'discuss',
    description: '轻量方案讨论 — 对比选项、确认方向、沉淀结论到文档站',
  },
  {
    name: 'docs-sync',
    description: '文档与代码对齐 — 扫描变更、对比文档、修正过时内容',
  },
  {
    name: 'doc-gen',
    description: '项目文档生成 — 扫描代码，自动生成完整开发文档',
  },
  {
    name: 'docs-all-in-one',
    description: '一站式 web 文档 — 生成完整文档集并搭建 VitePress 文档站',
  },
  {
    name: 'sidebar-sync',
    description: 'VitePress 侧边栏同步 — 补齐缺失菜单入口，清理死链',
  },
  {
    name: 'self-upgrade',
    description: '自升级 — 自动查找仓库拉取最新代码或通过 npx 升级',
  },
  {
    name: 'wxapkg-unpack',
    description: '微信小程序解包 — 解密 wxapkg 并反编译为可读工程目录',
  },
  {
    name: 'disk-clean',
    description: 'macOS 磁盘清理 — 排查大项、清理可再生缓存、大文件清单交用户决定',
  },
]

// 命令列表（技能对应的斜杠命令）
const COMMAND_LIST = [
  {
    name: 'skill:vitepress-doc-site',
    description: '将 Markdown 文件搭建为 VitePress 文档网站',
  },
  {
    name: 'skill:discuss',
    description: '启动轻量方案讨论',
  },
  {
    name: 'skill:docs-sync',
    description: '项目文档与代码对齐',
  },
  {
    name: 'skill:doc-gen',
    description: '根据项目代码生成完整开发文档',
  },
  {
    name: 'skill:docs-all-in-one',
    description: '一站式 web 文档 — 生成文档集并搭建 VitePress 文档站',
  },
  {
    name: 'skill:sidebar-sync',
    description: 'VitePress 侧边栏同步 — 补齐缺失菜单入口，清理死链',
  },
  {
    name: 'skill:self-upgrade',
    description: '升级 sunbirder-skill-tools 到最新版本',
  },
  {
    name: 'skill:wxapkg-unpack',
    description: '解密并反编译微信小程序 wxapkg 包',
  },
  {
    name: 'skill:disk-clean',
    description: 'macOS 磁盘清理 — 排查大项并释放空间',
  },
]

function getPackageDir() {
  return join(__dirname, '..')
}

function loadSkills() {
  return SKILL_LIST
}

function loadCommands() {
  return COMMAND_LIST
}

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
  for (const s of skipped) {
    console.log(`  跳过 ${s.id}（${s.homeDir} 不存在）`)
  }
}

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

function showHelp() {
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
}

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
    return
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
        return
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
    return
  }
}

// 导出函数供测试使用
export { loadSkills, loadCommands, installSkill, installCommand, installAll, upgradeAll, getPackageDir, resolveTargetPlatforms, extractPlatform, PLATFORMS, listSkills, main }

// 直接运行时执行 CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv)
}
