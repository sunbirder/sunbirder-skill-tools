---
name: docs-theme-upgrade
description: Use when the user wants to upgrade an existing VitePress documentation site to the latest theme template (layout skin, table enhancement, auto sidebar, Chinese search), or sync an old docs site with the newest vitepress-doc-site theme files
---

# VitePress 文档站主题升级

## Overview

将已有 VitePress 文档站增量升级到最新主题模板（源自 vitepress-doc-site 技能），只动主题层与配置，文档内容零改动。

## 升级目标（新版模板能力）

| 能力 | 文件 |
|------|------|
| 布局皮肤（三栏解锁 + 侧栏钉宽 + 顶栏跟随 + 面板开关） | `theme/layout.css` + `theme/enhance-layout.ts` |
| 表格增强（横滚 + ⤢ 弹窗） | `theme/tables.css` + `theme/enhance-tables.ts` |
| 主题入口 | `theme/index.ts` |
| 自动侧栏（可选） | `auto-sidebar.mjs` |
| 中文搜索分词 | config 内 `tokenizeSearchText` |

## 升级流程

### 1. 现状检测

- 目标项目 `docs/.vitepress/` 是否存在（不存在则转 vitepress-doc-site 全新搭建）
- 旧主题形态：单个 `theme/custom.css`（旧模板）还是已有五件套（仅需文件级覆盖）
- config 中是否有自定义搜索分词、自定义主题扩展、其他 CSS
- 端口：按技能规范扫描分配（从 5173 起间隔 10）

### 2. 原样照抄替换（不得凭记忆重写）

源文件从 sunbirder-skill-tools 仓库 `docs/.vitepress/` 读取（Read 源文件 → Write 目标同路径）：

```bash
# 旧模板结构：先删旧文件
rm docs/.vitepress/theme/custom.css   # 若存在

# 五件套 + 自动侧栏
cp <skill-tools>/docs/.vitepress/theme/{index.ts,layout.css,tables.css,enhance-tables.ts,enhance-layout.ts} docs/.vitepress/theme/
cp <skill-tools>/docs/.vitepress/auto-sidebar.mjs docs/.vitepress/   # 可选
```

### 3. config 对齐

- 补齐中文搜索分词 `tokenizeSearchText`（注入 `themeConfig.search.options.miniSearch.options.tokenize`）
- 确认 `optimizeDeps.include: ['fastdom', 'mermaid', 'mermaid/node_modules/dagre-d3-es']`
- 手写 sidebar 可选替换为 autoSidebar（需分组语义时保留手写）
- `docs/package.json` 必须含 `"type": "module"`

### 4. 验收（缺一不可）

1. **清缓存重启**：`rm -rf docs/.vitepress/cache` 后 `npm run dev`
2. **build 成功**：`npm run build`（只证明可编译，不够）
3. **真浏览器验证（L2 最低要求）**：
   - `.vp-layout-toggles` 存在，侧栏/大纲按钮可用
   - 宽屏（≥1440px）：`.VPSidebar` 宽 272px、padding 24px，`.VPContent` padding-left 同步
   - 收起侧栏：内容 padding 与顶栏背景条归零
   - 宽表格页：`.vp-table-scroll` 包裹 + ⤢ 弹窗开/关
   - 中文搜索：搜一个正文词汇有命中
4. **冲突检查**：旧站若有自定义 CSS/主题扩展，与 layout.css 选择器冲突时需人工协调（新皮肤用 `!important` 较多，优先让旧自定义样式改作用于更具体的容器）

### 5. 收尾

- 提交升级变更（主题文件 + config），按项目惯例 commit + push

## 注意事项

- 选择器按 VitePress **1.6.4** 实测；目标站若是其他版本，宽屏行为必须真浏览器重验
- setup() 时序坑： NavBar 未挂载时不能查 DOM 插按钮，模板已用 MutationObserver 处理，勿改写
- 双实例坑：启动前 `ps aux | grep "vitepress dev"` 查重，已有实例先 kill 清缓存
