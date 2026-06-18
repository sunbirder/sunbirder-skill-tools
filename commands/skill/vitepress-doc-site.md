---
name: skill:vitepress-doc-site
description: 将 Markdown 文件搭建为 VitePress 文档网站
argument-hint: [项目目录]
---

# VitePress 文档站搭建

将指定目录下的 Markdown 文件通过 VitePress 构建为带导航侧边栏的文档网站。

<objective>
在目标项目中搭建 VitePress 文档站，包含配置文件、首页、导航、侧边栏，让 Markdown 文件可以以 web 方式浏览。
</objective>

<rules>
- 先加载 vitepress-doc-site 技能获取完整搭建指南
- 自动检测目标目录是否已有 VitePress 配置，若已有则只补充缺失部分
- 导航和侧边栏从现有 .md 文件自动推断
- 所有用户文本使用中文
</rules>

<process>
## 1. 环境检查
- 确认 Node.js >= 18 已安装
- 确认目标目录结构

## 2. 依赖安装
- 添加 vitepress 到 devDependencies
- 如需 Mermaid 图表支持，安装 mermaid

## 3. 文档站创建
- 创建 `docs/` 目录和 `.vitepress/config.ts`
- 创建首页 `docs/index.md`（home layout）
- 扫描现有 .md 文件，生成侧边栏配置
- 配置 npm scripts（dev/build/preview）

## 4. 启动预览
- 运行 `npm run docs:dev` 打开预览
</process>
