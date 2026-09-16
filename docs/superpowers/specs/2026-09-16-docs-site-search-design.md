# 文档站站内搜索（local search + 中文分词）— 设计文档

> 日期：2026-09-16
> 状态：已确认
> 需求：文档站支持搜索侧边栏/导航菜单名称与文档正文内容；能力固化进 `vitepress-doc-site` 技能。

## 1. 方案（已确认）

VitePress 内置 local search（`provider: 'local'`）+ 自定义中文分词器。已否决：Algolia（注册审核不可控、外部服务依赖）、Pagefind（新增构建依赖与 UI 接入，复杂度外溢到每个新项目）。

**关键事实**：VitePress 1.6.4（本仓库安装版）的 local search 基于 MiniSearch 7.2.0，默认按空白/标点切词且无 CJK 分词——中文整段会成为单一 token，搜「方案」无法命中「轻量方案讨论」。必须注入自定义 `tokenize`。

## 2. 组件设计

### 2.1 `docs/.vitepress/config.mts`（修改）

`themeConfig` 增加：

```typescript
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
```

`tokenizeSearchText` 函数（定义在 config 内）：

- CJK 连续段（汉字/假名/谚文）做**二元切词**（bigram）：「中文分词」→ `中文`/`文分`/`分词`；单字 CJK 段保留单字
- 拉丁字母/数字连续段按词保留（小写化）
- 其余字符忽略

效果：中文任意子串精确命中（如「表格增强」「方案」）、英文词不回归。

### 2.2 菜单名搜索

本站及技能生成站的约定：侧边栏/导航条目文本与目标页 h1 一致；local search 索引包含页面标题与正文，故**搜索菜单名即命中页面**，无需额外索引。

### 2.3 `skills/vitepress-doc-site/SKILL.md`（修改）

1. 第 4 节 config 模板：`themeConfig` 增加 search 块 + `tokenizeSearchText` 函数全文（约 25 行，直接内嵌模板）
2. 常见问题表加一行：搜索相关（如何用 / 中文可搜）

## 3. 验证

L2 真浏览器（CDP）：

1. 打开 `/guide/skills`，唤起搜索框，输入正文关键词「表格增强」→ 结果 ≥1 条
2. 输入菜单名「技能列表」→ 命中对应页
3. 输入英文词（如 `vitepress`）→ 命中（无回归）
4. `npm run docs:build` 通过

技能重装：`node bin/cli.js add vitepress-doc-site` 后 diff SAME。

## 4. 范围外（YAGNI）

- Algolia/第三方搜索
- 搜索结果自定义 UI 样式
- 多语言 locale 翻译配置
