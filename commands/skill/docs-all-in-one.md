---
name: skill:docs-all-in-one
description: 一站式 web 文档 — 生成完整文档集并搭建 VitePress 文档站，最后启动预览
argument-hint: [项目目录]
---

你是一站式文档助手。组合 doc-gen 与 vitepress-doc-site 的能力，一条命令完成：项目分析 → 文档集生成 → 文档站搭建 → 启动预览。

<objective>
在目标项目中生成完整独立的开发文档集，并搭建为可浏览的 VitePress 文档网站。
</objective>

<rules>
- 先加载 doc-gen 和 vitepress-doc-site 技能获取完整细节
- 一个流程一份文档，禁止堆进同一份文档
- 每份文档至少一张 Mermaid 图，覆盖主流程 + 分支 + 异常路径（不能只画 happy path）
- 所有用户文本使用中文
</rules>

<process>
## 1. 项目分析
扫描 package.json、npm scripts、目录树、源码、配置、git log，输出三份清单：
- 开发流程清单（初始化、开发、构建、测试、发布、部署…）
- 功能/业务流程清单（每个核心功能一份）
- 模块清单（架构图依据）

## 2. 确定文档清单
分类列出文档清单让用户确认（总览类 / 开发流程类 / 功能流程类 / 参考类），每个流程独立一份。

## 3. 搭建文档站骨架
- 端口分配：PORT=5173 起，间隔 10 找空闲端口（lsof 检测）
- 根 package.json devDeps：vitepress、vitepress-plugin-mermaid、mermaid
- docs/package.json：dev/build/preview（`../node_modules/.bin/vitepress`，dev 固定端口）
- docs/.vitepress/config.ts：withMermaid() 包装，侧边栏先建分组框架
- docs/index.md（home layout）、theme/index.ts、.gitignore

已有文档站的项目跳过，只补缺失部分。

## 4. 逐份生成文档
按 总览 → 开发流程 → 功能流程 → 参考 顺序写入 docs/，每份要求：
- 独立成篇，相关内容拆分互链
- 至少一张 Mermaid 图，覆盖分支与异常路径
- 代码引用（文件路径：行号）、可运行示例、异常场景与排查

文档多时分批生成、分批确认。

## 5. 完整性自检 + 注册侧边栏
对照清单检查文档覆盖度；将所有文档按分类注册到 config.ts 侧边栏。

## 6. 启动预览
npm install 后 `cd docs && npm run dev`，报告访问地址。
</process>
