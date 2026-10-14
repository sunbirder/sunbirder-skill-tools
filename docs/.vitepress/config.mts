import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// 搜索分词：CJK 连续段二元切词（「中文分词」→ 中文/文分/分词；单字段保留单字），
// 拉丁/数字连续段按词保留（小写化）。VitePress 1.6.4 默认分词不支持中文，必须注入。
function tokenizeSearchText(text: string): string[] {
  const out: string[] = []
  const re = /[\p{Script=Han}぀-ヿ가-힯]+|[a-zA-Z0-9_]+/gu
  for (const m of text.matchAll(re)) {
    const s = m[0]
    if (/^[\p{Script=Han}぀-ヿ가-힯]/u.test(s)) {
      if (s.length === 1) {
        out.push(s)
      } else {
        for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2))
      }
    } else {
      out.push(s.toLowerCase())
    }
  }
  return out
}

export default withMermaid(
  defineConfig({
  title: 'sunbirder-skill-tools',
  description: '个人 Claude Code 技能工具集',
  lang: 'zh-CN',
  ignoreDeadLinks: true,

  themeConfig: {
    outline: { level: [2, 3] },
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: tokenizeSearchText,
          },
        },
      },
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/' },
      { text: '技能列表', link: '/guide/skills' },
      { text: '方案讨论', link: '/discussions/' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/' },
        { text: '技能列表', link: '/guide/skills' },
        {
          text: 'vitepress-doc-site',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/vitepress-doc-site' },
          ]
        },
        {
          text: 'discuss',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/discuss' },
          ]
        },
        {
          text: 'docs-sync',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/docs-sync' },
          ]
        },
        {
          text: 'doc-gen',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/doc-gen' },
          ]
        },
        {
          text: 'docs-all-in-one',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/docs-all-in-one' },
          ]
        },
        {
          text: 'self-upgrade',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/self-upgrade' },
          ]
        },
        {
          text: 'wxapkg-unpack',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/wxapkg-unpack' },
          ]
        },
        {
          text: 'disk-clean',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/disk-clean' },
          ]
        },
        {
          text: 'sidebar-sync',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/sidebar-sync' },
          ]
        },
        {
          text: 'docs-theme-upgrade',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/docs-theme-upgrade' },
          ]
        },
        {
          text: 'completion-contract',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/completion-contract' },
          ]
        },
        {
          text: 'prd-flow',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/prd-flow' },
          ]
        },
        {
          text: '设计能力（vendor 自 anthropics/skills）',
          collapsed: false,
          items: [
            { text: 'frontend-design · 前端视觉设计', link: '/guide/frontend-design' },
            { text: 'canvas-design · 视觉艺术设计', link: '/guide/canvas-design' },
            { text: 'theme-factory · 主题工厂', link: '/guide/theme-factory' },
          ]
        },
      ],
      '/discussions/': [
        { text: '方案讨论', link: '/discussions/' },
        {
          text: '2026-09-13',
          collapsed: false,
          items: [
            { text: '支持 DeepSeek Harness 平台', link: '/discussions/2026-09-13-dsh-platform-support' },
          ]
        },
      ],
      '/superpowers/': [
        {
          text: '历史方案（superpowers）',
          collapsed: true,
          items: [
            { text: '设计 · DSH 平台支持', link: '/superpowers/specs/2026-09-13-dsh-platform-support-design' },
            { text: '设计 · 文档站增强', link: '/superpowers/specs/2026-09-15-docs-site-enhancement-design' },
            { text: '设计 · 文档站搜索', link: '/superpowers/specs/2026-09-16-docs-site-search-design' },
            { text: '计划 · DSH 平台支持', link: '/superpowers/plans/2026-09-13-dsh-platform-support' },
            { text: '计划 · 文档站增强', link: '/superpowers/plans/2026-09-15-docs-site-enhancement' },
            { text: '计划 · 文档站搜索', link: '/superpowers/plans/2026-09-16-docs-site-search' },
          ]
        },
      ],
    },
    footer: {
      message: 'sunbirder-skill-tools',
    },
  },
})
)
