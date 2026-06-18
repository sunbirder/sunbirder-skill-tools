import { defineConfig } from 'vitepress'

export default defineConfig({
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
      ],
    },
    footer: {
      message: 'sunbirder-skill-tools',
    },
  },
})
