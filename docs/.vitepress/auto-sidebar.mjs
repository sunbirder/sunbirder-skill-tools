import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

// 自动侧栏生成 — 文件夹结构即菜单（能力源自 local-notes 项目的思路，零依赖重写）
//
// 用法（config.ts / config.mts 中）：
//   import { autoSidebar } from './auto-sidebar'
//
//   sidebar: {
//     '/guide/': autoSidebar({
//       rootDir: new URL('../guide', import.meta.url).pathname,
//       routePrefix: '/guide/',
//       indexText: '快速开始',        // 可选：目录 index.md 的菜单文案
//       exclude: ['templates'],       // 可选：排除的目录/文件名（不含 .md）
//     }),
//   }
//
// 规则：
// - 每个 .md 文件 = 一个菜单项；每个含 .md 的子目录 = 一个折叠分组
// - 标题优先级：frontmatter `title:` > 正文第一个 `# 标题` > 文件名
// - 目录的 index.md 渲染为分组前的直达链接（indexText 可改文案）
// - 目录内无 .md 文件时不生成（空目录、纯资源目录自动跳过）

/** 从 md 文件提取人类可读标题 */
function extractTitle(filePath, fallback) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (fm) {
      const t = fm[1].match(/^title:\s*(.+)$/m)
      if (t) return t[1].trim().replace(/^['"]|['"]$/g, '')
    }
    const h1 = content.match(/^#\s+(.+)$/m)
    if (h1) return h1[1].trim()
  } catch {
    // 读不到就用文件名
  }
  return fallback
}

/** 判断文件是否应被排除（相对路径任一段命中 exclude 即排除） */
function isExcluded(relPath, exclude = []) {
  if (exclude.length === 0) return false
  const segments = relPath.split(sep)
  return segments.some(seg => exclude.includes(seg.replace(/\.md$/, '')))
}

/** 递归构建一个目录的侧边栏节点 */
function buildDir(absDir, routePrefix, relFromRoot, options) {
  const { exclude, indexText } = options
  const entries = readdirSync(absDir, { withFileTypes: true })

  const items = []
  const groups = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue // 隐藏文件/目录
    const relPath = relFromRoot ? join(relFromRoot, entry.name) : entry.name
    if (isExcluded(relPath, exclude)) continue

    const abs = join(absDir, entry.name)

    if (entry.isDirectory()) {
      const sub = buildDir(abs, routePrefix, relPath, options)
      if (sub.items.length > 0) {
        groups.push({
          text: entry.name,
          collapsed: false,
          items: sub.items,
        })
      }
    } else if (entry.name.endsWith('.md')) {
      const route = routePrefix + relPath.split(sep).join('/').replace(/\.md$/, '')
      if (entry.name === 'index.md') {
        // 目录入口：用 indexText 或提取的标题
        items.push({
          text: indexText || extractTitle(abs, 'index'),
          link: routePrefix.replace(/\/$/, '') || '/',
        })
      } else {
        items.push({
          text: extractTitle(abs, entry.name.replace(/\.md$/, '')),
          link: route,
        })
      }
    }
  }

  return { items: [...items, ...groups] }
}

/**
 * 自动生成 VitePress sidebar 配置
 * @param {{ rootDir: string, routePrefix: string, indexText?: string, exclude?: string[] }} options
 * @returns {Array} VitePress sidebar 数组
 */
export function autoSidebar(options) {
  const { rootDir, routePrefix } = options
  return buildDir(rootDir, routePrefix, '', options).items
}
