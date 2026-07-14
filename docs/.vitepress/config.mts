import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
  title: 'sunbirder-skill-tools',
  description: '个人 Claude Code 技能工具集',
  lang: 'zh-CN',
  ignoreDeadLinks: true,

  themeConfig: {
    outline: { level: [2, 3] },
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
          text: 'self-upgrade',
          collapsed: false,
          items: [
            { text: '使用说明', link: '/guide/self-upgrade' },
          ]
        },
      ],
      '/discussions/': [
        { text: '方案讨论', link: '/discussions/' },
      ],
    },
    footer: {
      message: 'sunbirder-skill-tools',
    },
  },
})
)
