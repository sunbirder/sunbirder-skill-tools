# vitepress-doc-site

将 Markdown 文件搭建为 VitePress 文档网站。

## 触发条件

- 用户说 "把这个项目的 markdown 文档搭成网页"
- 用户说 "帮我建个 VitePress 文档站"
- 用户说 "把 docs 目录用 web 方式展示"

## 功能

1. 检测 Node.js 环境，添加 vitepress 依赖
2. 创建 `docs/.vitepress/config.ts`（导航、侧边栏）
3. 创建首页 `docs/index.md`（home layout）
4. 扫描现有 .md 文件自动生成侧边栏配置
5. 配置 `dev`/`build`/`preview` npm scripts
6. 可选：注册 Mermaid 图表支持

## 输出结构

```
project/
├── package.json          # 新增 vitepress 依赖和 scripts
├── docs/
│   ├── index.md          # 首页
│   ├── .vitepress/
│   │   ├── config.ts     # 站点配置
│   │   └── theme/
│   │       └── index.ts  # 主题扩展
│   └── guide/            # 文档内容
```

## 示例

### 导航栏
```typescript
nav: [
  { text: '首页', link: '/' },
  { text: '指南', link: '/guide/' },
]
```

### 侧边栏（折叠组）
```typescript
sidebar: {
  '/guide/': [
    {
      text: '分组名',
      collapsed: false,
      items: [
        { text: '页面一', link: '/guide/page1' },
      ]
    },
  ],
}
```

### Mermaid 支持
````typescript
markdown: {
  config: (md) => {
    const defaultRender = md.renderer.rules.fence!
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      if (token.info.trim() === 'mermaid') {
        return `<Mermaid code="${md.utils.escapeHtml(token.content.trim())}" />`
      }
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}
````
