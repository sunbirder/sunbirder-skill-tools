# VitePress 文档站增强（内容加宽 + 表格弹窗）— 设计文档

> 日期：2026-09-15
> 状态：已确认（两节设计经逐节评审）
> 背景：本仓库文档站与 `vitepress-doc-site` 技能生成的站点存在两个问题：内容列过窄（默认 752/784px，宽屏左右留白过多）；宽表格列数多时原地压缩无法全部展示。

## 1. 目标

1. 文档内容区加宽：≥960px 视口下内容列占主区约 80%（默认的约 1000px+ vs 原 752px），右侧大纲保留
2. 表格支持弹窗最大化：hover 浮出 ⤢ 按钮，点击打开近全屏弹窗，宽表铺满横向滚动
3. 两项能力固化进 `vitepress-doc-site` 技能模板，未来生成的站点默认具备

## 2. 方案（已确认：方案A 主题客户端增强）

对内容零侵入、零新依赖：VitePress 是 SPA，在主题层做 CSS 覆盖 + 客户端 DOM 增强，既有与未来的 Markdown 表格自动生效。已否决：Vue 包裹组件（内容侵入，每篇 Markdown 都要改）、社区插件（无确定性满足需求的成熟插件）。

技术事实：VitePress 1.x 内容列宽由 `VPDoc.vue` 的 `.container`（992px@≥960 / 1104px@≥1280）与 `.content-container`（752px@≥960 / 784px@≥1440）控制；右侧大纲（aside）≥1280px 显示。

## 3. 组件设计

### 3.1 `docs/.vitepress/theme/custom.css`（新建）

职责：布局覆盖 + 表格增强的全部样式。

```css
/* 布局加宽：内容列吃满容器剩余空间（aside 224px 保留） */
@media (min-width: 960px) {
  .VPDoc .container { max-width: 1440px; }
  .VPDoc .content-container { max-width: 100%; }
}
```

表格增强样式（同文件）：`.vp-table-scroll`（overflow-x: auto; position: relative）、悬浮按钮（绝对定位右上角，默认透明度 0，wrapper hover 时显现）、弹窗遮罩（fixed，95vw × 90vh 居中，z-index 高于站点 chrome）、弹窗内表格（width: 100%，容器 overflow: auto）、关闭按钮。颜色一律用 VitePress CSS 变量（`--vp-c-bg`、`--vp-c-text-1`、`--vp-c-border` 等），深浅色自动适配。

### 3.2 `docs/.vitepress/theme/enhance-tables.ts`（新建）

职责：客户端表格增强，纯原生 JS，无依赖。导出 `enhanceTables()`，由主题 `setup()` 调用。

行为契约：

1. **横滚基线**：为 `.vp-doc table` 包裹 `div.vp-table-scroll`（原文档位置不变）；用 `data-enhanced` 属性防止重复包裹
2. **⤢ 按钮**：注入到 wrapper 内，仅 wrapper hover 时可见（CSS 控制）；`aria-label="最大化表格"`（中文，遵循项目约束）
3. **弹窗**：单例 overlay（复用同一 DOM，首次点击时创建）；内容为被点表格的 `cloneNode(true)`（原文档不动）；弹窗内表格铺满宽度、容器可双向滚动；打开时 `document.body` 滚动锁定
4. **关闭**：✕ 按钮、`Escape` 键、点击遮罩空白（弹窗面板外）三种方式；关闭时恢复滚动、移除 clone、焦点归还触发按钮
5. **路由适配**：`MutationObserver` 监听正文容器，SPA 路由切换后新出现的表格同样增强（observer 挂在 `#app` 下的正文根，防重复由 `data-enhanced` 保证）
6. **作用域**：仅 `.vp-doc table`——首页（home layout）无 `.vp-doc`，天然不受影响；Mermaid 图非 table，不涉及

### 3.3 `docs/.vitepress/theme/index.ts`（修改）

在现有 `extends: DefaultTheme` 基础上增加 `setup()`（VitePress 主题客户端钩子）：import custom.css、调用 `enhanceTables()`。

## 4. 数据流

无数据、无持久化。静态资源随站点构建（custom.css 由主题 import 打包；enhance-tables.ts 为客户端模块）。运行时 DOM 流：正文渲染 → observer 发现新表格 → 包裹 + 注入按钮 → 用户点击 → clone 进单例弹窗 → 关闭销毁 clone。

## 5. 错误处理与边界

| 情形 | 行为 |
|------|------|
| 表格内含链接/按钮 | 按钮仅悬浮于 wrapper 右上角，不覆盖单元格内容层；弹窗内链接可正常点击（clone 完整保留） |
| 弹窗打开时路由切换（SPA 侧边栏导航不可用，但键盘/后退可能） | 关闭逻辑随 observer/路由变化兜底：body 滚动锁定必须在任何关闭路径上解除 |
| 重复调用 enhanceTables（HMR/多次 setup） | 所有注入点以 `data-enhanced` 幂等 |
| 极窄表（无横向溢出） | 弹窗内表格自然铺满，按钮仍可用（预览一致性）；横滚容器无滚动条，无害 |
| SSR/构建期 | enhance-tables 仅在 `setup()`（客户端）执行，构建无副作用 |

## 6. 技能固化（`skills/vitepress-doc-site/SKILL.md` 修改）

1. "项目结构"图：theme/ 下补 `custom.css`、`enhance-tables.ts`
2. "主题扩展"一节：模板升级为三件套全文（index.ts 含 `setup()` 调用、custom.css 全文、enhance-tables.ts 全文），并注明"此为内置能力，生成的站点默认具备；不需要的站点删除 index.ts 中的调用即可"
3. 不改动 `docs-all-in-one`（组合引用，自动继承）、不改动 `doc-gen`（只管内容不管站点）

## 7. 验证

1. `npm run docs:dev` 启动本仓库站点，按技能 L2 标准用真实浏览器（CDP）验证：
   - 内容宽度生效（computed style 检查 `.content-container`）
   - discussions 宽表（方案对比表）出现 ⤢ 按钮 → 点击弹窗 → 表格铺满 → ESC 关闭
   - 路由切换到另一页再回来，增强依然生效
2. `npm run docs:build` 通过
3. 本仓库站点验证通过后，重装技能（`node bin/cli.js add vitepress-doc-site`）使 `~/.claude/skills/` 同步最新模板

## 8. 范围外（YAGNI）

- 表格排序/搜索/导出等富功能
- 弹窗内编辑
- 首页 hero 区加宽
- 其他主题（非 default）适配
- 移动端专门优化（≥960px 才生效，窄屏维持 VitePress 默认响应式）
