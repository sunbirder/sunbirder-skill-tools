#!/usr/bin/env node

// sunbirder-skill-tools CLI
// 将技能 Markdown 文件和斜杠命令安装到 Claude Code 目录

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getHome() {
  return process.env.HOME || process.env.USERPROFILE
}

function getSkillsTarget() {
  return join(getHome(), '.claude', 'skills')
}

function getCommandsTarget() {
  return join(getHome(), '.claude', 'commands')
}

// 技能列表
const SKILL_LIST = [
  {
    name: 'vitepress-doc-site',
    description: '将 Markdown 文件搭建为 VitePress 文档网站',
  },
]

// 命令列表（技能对应的斜杠命令）
const COMMAND_LIST = [
  {
    name: 'skill:vitepress-doc-site',
    description: '将 Markdown 文件搭建为 VitePress 文档网站',
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

function installSkill(skillName) {
  const pkgDir = getPackageDir()
  const src = join(pkgDir, 'skills', skillName)
  const dest = join(getSkillsTarget(), skillName)

  if (!existsSync(src)) {
    console.error(`错误：技能 "${skillName}" 不存在`)
    process.exit(1)
  }

  mkdirSync(dest, { recursive: true })

  // 复制 SKILL.md
  const skillFile = join(src, 'SKILL.md')
  if (existsSync(skillFile)) {
    writeFileSync(join(dest, 'SKILL.md'), readFileSync(skillFile))
    console.log(`  ✓ 已安装技能: ${skillName}`)
  }
}

function installCommand(commandName) {
  const pkgDir = getPackageDir()
  // commandName 格式: "category:name"，文件路径: commands/category/name.md
  const parts = commandName.split(':')
  const srcPath = parts.length > 1
    ? join(pkgDir, 'commands', parts[0], `${parts[1]}.md`)
    : join(pkgDir, 'commands', `${commandName}.md`)
  const destDir = parts.length > 1
    ? join(getCommandsTarget(), parts[0])
    : getCommandsTarget()
  const dest = join(destDir, `${commandName}.md`)

  if (!existsSync(srcPath)) {
    console.error(`错误：命令 "${commandName}" 不存在`)
    process.exit(1)
  }

  mkdirSync(destDir, { recursive: true })
  writeFileSync(dest, readFileSync(srcPath))
  console.log(`  ✓ 已安装命令: /${commandName}`)
}

function installAll() {
  console.log('安装 sunbirder-skill-tools...\n')

  console.log('[Skills]')
  for (const skill of loadSkills()) {
    installSkill(skill.name)
  }

  console.log('\n[Commands]')
  for (const cmd of loadCommands()) {
    installCommand(cmd.name)
  }

  console.log('\n安装完成！')
}

function listSkills() {
  console.log('可用技能：\n')
  for (const skill of loadSkills()) {
    console.log(`  ${skill.name.padEnd(30)} ${skill.description}`)
  }
  console.log('\n可用命令：\n')
  for (const cmd of loadCommands()) {
    console.log(`  /${cmd.name.padEnd(30)} ${cmd.description}`)
  }
}

function showHelp() {
  console.log(`sunbirder-skills — 个人 Claude Code 技能工具集

用法:
  sunbirder-skills install          安装全部技能和命令
  sunbirder-skills add <skill>       安装指定技能
  sunbirder-skills list              列出可用技能

快捷方式（兼容旧版）:
  sunbirder-skills --all             等同于 install
  sunbirder-skills --list            等同于 list
  sunbirder-skills <skill>           等同于 add <skill>

npx 安装:
  npx sunbirder/sunbirder-skill-tools install
  npx sunbirder/sunbirder-skill-tools add vitepress-doc-site`)
}

function main(argv) {
  const args = argv.slice(2)

  if (args.length === 0) {
    showHelp()
    process.exit(0)
  }

  const arg = args[0]
  const target = args[1]

  switch (arg) {
    case 'install':
    case '--all':
      installAll()
      break
    case 'add':
      if (!target) {
        console.error('错误：请指定要安装的技能名称')
        listSkills()
        process.exit(1)
      }
      installSkillByName(target)
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
        installSkillByName(arg)
      } else {
        console.error(`错误：未知选项 "${arg}"`)
        console.error('使用 list 查看可用技能，或 --help 查看帮助')
        process.exit(1)
      }
      break
  }
}

function installSkillByName(skillName) {
  const skillNames = loadSkills().map(s => s.name)
  const cmdNames = loadCommands().map(c => c.name)
  if (skillNames.includes(skillName)) {
    installSkill(skillName)
    // 同时安装对应命令
    const cmd = cmdNames.find(c => c.includes(skillName))
    if (cmd) installCommand(cmd)
  } else {
    console.error(`错误：未知技能 "${skillName}"`)
    console.error('使用 list 查看可用技能')
    process.exit(1)
  }
}

// 导出函数供测试使用
export { loadSkills, loadCommands, installSkill, installCommand, getPackageDir }

// 直接运行时执行 CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv)
}
