# VitePress 文档站增强（内容加宽 + 表格弹窗）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 文档站内容列 ≥960px 视口加宽至主区约 80%；所有 `.vp-doc` 表格获得横滚基线 + 悬浮 ⤢ 按钮打开近全屏弹窗；三项文件固化进 `vitepress-doc-site` 技能模板。

**Architecture:** 主题层零依赖增强——`custom.css` 覆盖 VitePress `VPDoc` 宽度规则并提供表格增强样式；`enhance-tables.ts` 在主题 `setup()`（客户端）运行，包裹表格 + 注入按钮 + 管理单例弹窗，`MutationObserver` 覆盖 SPA 路由切换。对 Markdown 内容零侵入。

**Tech Stack:** VitePress 1.6（default theme 扩展）、TypeScript（仅文档站主题文件，与既有 `config.mts`/`theme/index.ts` 同类约定）、原生 DOM API、CSS 变量深浅色适配。

**Spec:** `docs/superpowers/specs/2026-09-15-docs-site-enhancement-design.md`（已批准）

## Global Constraints

- 所有用户可见文本（aria-label、注释、文档）使用中文
- 不新增任何 npm 依赖（VitePress/mermaid 既有依赖之外）
- `enhance-tables.ts` 仅在客户端执行（theme `setup()` 内），SSR/构建无副作用；`enhance-tables.ts` 第一行守卫 `typeof document === 'undefined'` 直接返回
- 所有注入以 `data-enhanced` 幂等，防重复包裹
- 颜色一律使用 VitePress CSS 变量（`--vp-c-bg` / `--vp-c-text-1` / `--vp-c-text-2` / `--vp-c-border`），深浅色自动适配
- 验证必须走真浏览器（技能"踩坑实录"第 4 条：curl 200 ≠ 页面正常）；L2 = CDP eval DOM 断言；构建验证 `npm run docs:build`
- dev 启动前必查单实例（技能踩坑第 1 条）：`lsof -nP -i :5173 -sTCP:LISTEN` 和 `ps aux | grep "vitepress dev" | grep -v grep`，已有实例不重复启动；重启先 `pkill -f "vitepress dev"` 并清 `docs/.vitepress/cache/`
- CDP 前置：web-access 技能 proxy（`node /Users/sunbirder/.claude/skills/web-access/scripts/check-deps.mjs` 启动，API 在 `http://localhost:3456`）；cdp-proxy.mjs 如切换过浏览器需 `pkill -f cdp-proxy.mjs` 后重跑
- 提交信息风格：中文 Conventional Commits

---

### Task 1: 布局加宽（custom.css + 主题接线）

**Files:**
- Create: `docs/.vitepress/theme/custom.css`
- Modify: `docs/.vitepress/theme/index.ts`（现为 5 行裸 `extends: DefaultTheme`）

**Interfaces:**
- Consumes: VitePress default theme 的 `.VPDoc .container` / `.VPDoc .content-container` 类
- Produces: `custom.css` 供 Task 2 追加"表格增强"样式段（文件顶部有分节注释结构）；`index.ts` 在 Task 2 再加 `setup()`

- [ ] **Step 1: 创建 custom.css（布局段）**

写入 `docs/.vitepress/theme/custom.css` 全文：

```css
/* 文档站主题定制：内容加宽 + 表格增强 */
/* 分节结构：一、布局加宽；二、表格增强（表格段由表格增强任务追加在文末） */

/* ============ 一、布局加宽 ============ */
/* VitePress 默认 .container 992/1104px、.content-container 752/784px，
   宽屏左右留白过多。≥960px 视口：容器放宽至 1440px，内容列吃满
   容器减去右侧大纲（224px，≥1280px 显示）后的空间，约为主区 80%。 */
@media (min-width: 960px) {
  .VPDoc .container {
    max-width: 1440px;
  }
  .VPDoc .content-container {
    max-width: 100%;
  }
}
```

- [ ] **Step 2: 主题接入 custom.css**

替换 `docs/.vitepress/theme/index.ts` 全文为：

```typescript
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
}
```

- [ ] **Step 3: 构建验证**

Run: `npm run docs:build`
Expected: 构建成功无报错（custom.css 被主题打包）

- [ ] **Step 4: 真浏览器验证（L2）**

启动 dev（先按 Global Constraints 查单实例）并跑 CDP：

```bash
cd docs && npm run dev   # 端口 5173，后台运行
node /Users/sunbirder/.claude/skills/web-access/scripts/check-deps.mjs
TARGET=$(curl -s -X POST --data-raw 'http://127.0.0.1:5173/guide/skills' http://localhost:3456/new | python3 -c 'import json,sys;print(json.load(sys.stdin)["targetId"])')
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'JSON.stringify({container: getComputedStyle(document.querySelector(".VPDoc .container")).maxWidth, content: getComputedStyle(document.querySelector(".VPDoc .content-container")).maxWidth, docWidth: document.querySelector(".vp-doc").getBoundingClientRect().width})'
```

Expected: `container` = `"1440px"`、`content` = `"100%"`、`docWidth` ≈ 1000±100（视口 1440 左右时；原默认 752）。若视口宽不同，核对 docWidth 相比默认值明显加宽即可。

验证完关闭自建 tab：`curl -s "http://localhost:3456/close?target=$TARGET"`

- [ ] **Step 5: 提交**

```bash
git add docs/.vitepress/theme/custom.css docs/.vitepress/theme/index.ts
git commit -m "feat(docs): 内容区加宽 — ≥960px 视口内容列占主区约 80%"
```

---

### Task 2: 表格增强（enhance-tables.ts + 样式 + setup 接线）

**Files:**
- Create: `docs/.vitepress/theme/enhance-tables.ts`
- Modify: `docs/.vitepress/theme/custom.css`（文末追加"表格增强"段）
- Modify: `docs/.vitepress/theme/index.ts`（加 `setup()`）

**Interfaces:**
- Consumes: Task 1 的 `custom.css`（追加）、`index.ts` 结构
- Produces: `enhanceTables(): void`（模块唯一导出）；CSS 类名契约——`vp-table-scroll`、`vp-table-max-btn`、`vp-table-overlay`、`vp-table-overlay-panel`、`vp-table-overlay-close`、`vp-table-overlay-body`、`vp-table-locked`（Task 3 模板原样固化这三份文件）

- [ ] **Step 1: 创建 enhance-tables.ts**

写入 `docs/.vitepress/theme/enhance-tables.ts` 全文：

```typescript
// 表格客户端增强：横滚包裹 + 悬浮放大按钮 + 全屏弹窗
// 由主题 setup() 调用一次；SPA 路由切换后新表格由 MutationObserver 自动补齐
// 纯原生 JS，无依赖；样式见同目录 custom.css

export function enhanceTables(): void {
  if (typeof document === 'undefined') return

  let overlay: HTMLDivElement | null = null
  let lastTrigger: HTMLButtonElement | null = null

  const closeOverlay = (): void => {
    if (!overlay) return
    overlay.classList.remove('is-open')
    document.body.classList.remove('vp-table-locked')
    const body = overlay.querySelector('.vp-table-overlay-body')
    if (body) body.innerHTML = ''
    if (lastTrigger) {
      lastTrigger.focus()
      lastTrigger = null
    }
  }

  const ensureOverlay = (): HTMLDivElement => {
    if (overlay) return overlay
    overlay = document.createElement('div')
    overlay.className = 'vp-table-overlay'
    overlay.innerHTML =
      '<div class="vp-table-overlay-panel" role="dialog" aria-modal="true" aria-label="表格最大化视图">' +
      '<button type="button" class="vp-table-overlay-close" aria-label="关闭">✕</button>' +
      '<div class="vp-table-overlay-body"></div>' +
      '</div>'
    document.body.appendChild(overlay)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay()
    })
    overlay
      .querySelector('.vp-table-overlay-close')!
      .addEventListener('click', closeOverlay)
    return overlay
  }

  const openOverlay = (
    table: HTMLTableElement,
    trigger: HTMLButtonElement,
  ): void => {
    const o = ensureOverlay()
    lastTrigger = trigger
    const body = o.querySelector('.vp-table-overlay-body')!
    body.innerHTML = ''
    body.appendChild(table.cloneNode(true))
    o.classList.add('is-open')
    document.body.classList.add('vp-table-locked')
    o.querySelector<HTMLElement>('.vp-table-overlay-close')!.focus()
  }

  const wrapTable = (table: HTMLTableElement): void => {
    const wrapper = document.createElement('div')
    wrapper.className = 'vp-table-scroll'
    table.parentNode!.insertBefore(wrapper, table)
    wrapper.appendChild(table)

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'vp-table-max-btn'
    btn.setAttribute('aria-label', '最大化表格')
    btn.textContent = '⤢'
    btn.addEventListener('click', () => openOverlay(table, btn))
    wrapper.appendChild(btn)
  }

  const scan = (): void => {
    document.querySelectorAll<HTMLTableElement>('.vp-doc table').forEach((t) => {
      if (t.dataset.enhanced) return
      t.dataset.enhanced = 'true'
      wrapTable(t)
    })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay()
  })

  scan()
  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      scan()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
```

- [ ] **Step 2: custom.css 文末追加表格增强段**

在 `docs/.vitepress/theme/custom.css` 末尾追加：

```css
/* ============ 二、表格增强 ============ */
/* 横滚基线：原地表格可横向滚动；hover 右上角浮出 ⤢ 按钮 */
.vp-table-scroll {
  position: relative;
  overflow-x: auto;
}

.vp-table-max-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
  width: 26px;
  height: 26px;
  line-height: 1;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
}

.vp-table-scroll:hover .vp-table-max-btn,
.vp-table-max-btn:focus-visible {
  opacity: 1;
}

/* 近全屏弹窗（单例，由 enhance-tables.ts 创建与复用） */
.vp-table-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
}

.vp-table-overlay.is-open {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vp-table-overlay-panel {
  display: flex;
  flex-direction: column;
  width: 95vw;
  height: 90vh;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
}

.vp-table-overlay-close {
  align-self: flex-end;
  margin: 8px 8px 0 0;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.vp-table-overlay-body {
  flex: 1;
  overflow: auto;
  padding: 0 24px 24px;
}

.vp-table-overlay-body table {
  width: 100%;
}

/* 弹窗打开时锁定页面滚动 */
body.vp-table-locked {
  overflow: hidden;
}
```

- [ ] **Step 3: index.ts 加 setup()**

替换 `docs/.vitepress/theme/index.ts` 全文为：

```typescript
import DefaultTheme from 'vitepress/theme'
import { enhanceTables } from './enhance-tables'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    enhanceTables()
  },
}
```

- [ ] **Step 4: 构建验证**

Run: `npm run docs:build`
Expected: 构建成功无报错

- [ ] **Step 5: 真浏览器验证（L2，四项断言）**

dev 热更新会自动生效（若 dev 未运行按 Global Constraints 启动）。CDP：

```bash
TARGET=$(curl -s -X POST --data-raw 'http://127.0.0.1:5173/guide/skills' http://localhost:3456/new | python3 -c 'import json,sys;print(json.load(sys.stdin)["targetId"])')
```

断言 1 —— 包裹与按钮注入（包裏数 = 表格数且 >0）：

```bash
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'JSON.stringify({wrapped: document.querySelectorAll(".vp-table-scroll").length, tables: document.querySelectorAll(".vp-doc table").length, btns: document.querySelectorAll(".vp-table-max-btn").length})'
```

Expected: `wrapped` = `tables` 且 `> 0`，`btns` = `tables`

断言 2 —— 点击 ⤢ 打开弹窗（clone 进面板 + 滚动锁定）：

```bash
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'document.querySelector(".vp-table-max-btn").click(); JSON.stringify({open: document.querySelector(".vp-table-overlay").classList.contains("is-open"), cloneRows: document.querySelectorAll(".vp-table-overlay-body tr").length, locked: document.body.classList.contains("vp-table-locked")})'
```

Expected: `open` = `true`、`cloneRows` = 原表格行数（>0）、`locked` = `true`

断言 3 —— ESC 关闭（锁解除 + clone 清空）：

```bash
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'document.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"})); JSON.stringify({open: document.querySelector(".vp-table-overlay").classList.contains("is-open"), locked: document.body.classList.contains("vp-table-locked")})'
```

Expected: `open` = `false`、`locked` = `false`

断言 4 —— 幂等（手动再触发 scan 场景模拟：无重复包裹）：

```bash
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'document.querySelectorAll(".vp-table-scroll").length + ":" + document.querySelectorAll(".vp-doc table").length'
```

Expected: 两数相等（观察一段时间后仍不变，无嵌套 wrapper）

另做一次 SPA 路由切换验证（断言 5）：从 `/guide/skills` 页内点击侧边栏另一链接再返回，重跑断言 1 —— 数字仍相等（observer 补齐新渲染表格）。

```bash
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'document.querySelector('.vp-sidebar-item[href="/guide/discuss"]').click(); "navigated"'
sleep 2
curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'JSON.stringify({wrapped: document.querySelectorAll(".vp-table-scroll").length, tables: document.querySelectorAll(".vp-doc table").length})'
```

验证完 `curl -s "http://localhost:3456/close?target=$TARGET"` 关闭自建 tab。

- [ ] **Step 6: 提交**

```bash
git add docs/.vitepress/theme/enhance-tables.ts docs/.vitepress/theme/custom.css docs/.vitepress/theme/index.ts
git commit -m "feat(docs): 表格增强 — 横滚基线 + 悬浮⤢按钮 + 近全屏弹窗"
```

---

### Task 3: 技能固化（SKILL.md 模板更新 + 重装验证）

**Files:**
- Modify: `skills/vitepress-doc-site/SKILL.md`（项目结构图、第 5 节"主题扩展"）
- 无代码文件改动；本任务交付物是技能模板与新文件的同步

**Interfaces:**
- Consumes: Task 1/2 的三份最终文件（`index.ts`、`custom.css`、`enhance-tables.ts`）
- Produces: SKILL.md 模板与仓库三文件逐字一致；`~/.claude/skills/vitepress-doc-site/SKILL.md` 为最新版

- [ ] **Step 1: 更新"项目结构"图**

SKILL.md 中项目结构代码块里 `.vitepress` 部分（原 4 行）替换为：

```
    └── .vitepress/
        ├── config.ts         # 站点配置（核心文件）
        └── theme/
            ├── index.ts           # 主题扩展（引入 custom.css，setup() 调用 enhanceTables）
            ├── custom.css         # 内置能力样式：内容加宽 + 表格增强
            └── enhance-tables.ts  # 内置能力脚本：表格横滚 / ⤢ 弹窗最大化
```

- [ ] **Step 2: 替换"主题扩展"一节**

SKILL.md 中 `### 5. 主题扩展 (\`docs/.vitepress/theme/index.ts\`)` 一节（原含单个 index.ts 模板）整体替换为：

```markdown
### 5. 主题扩展（内置能力：内容加宽 + 表格增强）

主题层内置两个开箱即用的能力，三份文件为固定模板，**新站点按原文照抄**（源文件可参考 sunbirder-skill-tools 仓库 `docs/.vitepress/theme/`）：

- **内容加宽**：≥960px 视口内容列占主区约 80%（默认 752/784px 过窄）
- **表格增强**：所有表格横滚基线 + hover 右上角 ⤢ 按钮打开近全屏弹窗（95vw×90vh，ESC/遮罩/✕ 关闭），宽表列多时不再压缩展示

不需要这两个能力的站点，删除 `index.ts` 中的 `import './custom.css'`、`setup()` 及两个文件即可。

#### `docs/.vitepress/theme/index.ts`

```typescript
import DefaultTheme from 'vitepress/theme'
import { enhanceTables } from './enhance-tables'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    enhanceTables()
  },
}
```

#### `docs/.vitepress/theme/custom.css`

样式全文较长（约 120 行，分"布局加宽"与"表格增强"两节，注释齐全），从源仓库 `docs/.vitepress/theme/custom.css` 原样复制，**不得凭记忆重写**。

#### `docs/.vitepress/theme/enhance-tables.ts`

增强脚本全文（`enhanceTables()` 单导出，约 90 行，含 `data-enhanced` 幂等与 MutationObserver 路由适配），从源仓库 `docs/.vitepress/theme/enhance-tables.ts` 原样复制，**不得凭记忆重写**。

> **为什么不在技能里内嵌全文**：两个文件合计 200+ 行，内嵌会让 SKILL.md 膨胀且极易在誊抄中失真。指向"源仓库原样复制"是唯一可靠路径——执行技能时用 Read 工具读取源仓库文件内容写入新项目。
```

- [ ] **Step 3: 更新"常见问题"表（补一行）**

在"常见问题"表格末尾追加一行：

```markdown
| 表格列太多显示不全 | 内置表格增强：原地横滚，或 hover 表格点右上角 ⤢ 打开全屏弹窗 |
```

- [ ] **Step 4: 一致性验证（模板 ↔ 源文件）**

Run: `grep -c "custom.css" skills/vitepress-doc-site/SKILL.md` 与 `grep -c "enhance-tables" skills/vitepress-doc-site/SKILL.md`
Expected: 均 ≥ 3（结构图 + 主题扩展节 + 说明）

Run: `npm run docs:build`
Expected: 仍成功（SKILL.md 改动不影响构建，此处确认无意外破坏）

- [ ] **Step 5: 重装技能到 ~/.claude/skills/**

Run: `node bin/cli.js add vitepress-doc-site`
Expected: 输出 `[claude] ✓ 已安装技能: vitepress-doc-site`（及 `[dsh]` 行，若本机存在 ~/.dsh）

Run: `diff ~/.claude/skills/vitepress-doc-site/SKILL.md skills/vitepress-doc-site/SKILL.md && echo SAME`
Expected: `SAME`（安装副本与仓库一致）

- [ ] **Step 6: 提交**

```bash
git add skills/vitepress-doc-site/SKILL.md
git commit -m "feat(skills): vitepress-doc-site 固化内容加宽与表格增强内置能力"
```

---

## 自审记录

- **Spec 覆盖**：§3.1（custom.css 布局段+表格段）→ Task 1 Step 1 / Task 2 Step 2；§3.2（enhanceTables 六条契约：包裹幂等/按钮/单例 clone 弹窗/三种关闭含焦点归还/observer 路由适配/仅 .vp-doc）→ Task 2 Step 1 代码 + 五项 CDP 断言；§3.3（index.ts setup）→ Task 1 Step 2 + Task 2 Step 3；§6 技能固化三条 → Task 3；§7 验证（build/L2 CDP/路由往返/技能重装）→ 各 Task 验证步 + Task 3 Step 5。§8 范围外未混入。
- **占位符扫描**：无 TBD/TODO；custom.css 与 enhance-tables.ts 在技能模板中以"源仓库原样复制"约束（并说明理由），属对失真风险的防护而非占位——执行技能的 agent 有明确动作（Read 源文件写入新项目）。
- **类型一致性**：`enhanceTables` 导出名、7 个 CSS 类名（vp-table-scroll / vp-table-max-btn / vp-table-overlay / vp-table-overlay-panel / vp-table-overlay-close / vp-table-overlay-body / vp-table-locked）在 TS、CSS、CDP 断言、SKILL.md 文案四处一致。
