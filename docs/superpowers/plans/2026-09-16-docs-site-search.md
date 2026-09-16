# 文档站站内搜索（local search + 中文分词）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 文档站启用 VitePress local search 并注入中文二元分词器，可搜菜单名与正文；固化进 `vitepress-doc-site` 技能模板。

**Architecture:** 纯 config 层增强——`themeConfig.search.provider: 'local'` + `options.miniSearch.options.tokenize` 注入自定义分词函数（CJK 二元切词 + 拉丁词保留）；技能模板同步该段 config。

**Tech Stack:** VitePress 1.6.4 local search（MiniSearch 7.2.0）、TypeScript（config.mts）、CDP 真浏览器验证。

**Spec:** `docs/superpowers/specs/2026-09-16-docs-site-search-design.md`（已批准）

## Global Constraints

- 所有用户文本/注释中文；不新增 npm 依赖
- 本仓库 dev 端口已钉 **5175**（`docs/package.json`）；验证前确认服务存活：`curl -s --max-time 2 http://127.0.0.1:5175 >/dev/null || (cd docs && npm run dev &) ；sleep 5`
- CDP 前置：web-access proxy（`node /Users/sunbirder/.claude/skills/web-access/scripts/check-deps.mjs`；API `http://localhost:3456`）；本机网络对 GitHub SSH 需走 127.0.0.1:7892 代理（与搜索验证无关）
- 修改 config.mts 会触发 dev 自动重启，等 5 秒再验证
- 提交信息：中文 Conventional Commits

---

### Task 1: config 启用搜索 + 中文分词 + 真浏览器验证

**Files:**
- Modify: `docs/.vitepress/config.mts`（`withMermaid(defineConfig({ themeConfig: { ... } }))` 内部）

**Interfaces:**
- Consumes: 既有 config.mts 结构（themeConfig 含 outline/nav/sidebar/footer）
- Produces: `tokenizeSearchText(text: string): string[]`（config 内函数，Task 2 模板原样固化）；站点导航栏搜索框 + ⌘K 可用

- [ ] **Step 1: 修改 config.mts**

在 `docs/.vitepress/config.mts` 顶部 `import` 之后、`export default` 之前加入函数：

```typescript
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
```

`themeConfig` 内（`outline` 之后）加入：

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

- [ ] **Step 2: 构建验证**

Run: `cd docs && npm run build`
Expected: 构建成功（索引生成无报错）

- [ ] **Step 3: 真浏览器三断言（L2）**

```bash
curl -s --max-time 2 http://127.0.0.1:5175 >/dev/null || (cd docs && npm run dev &); sleep 5
TARGET=$(curl -s -X POST --data-raw 'http://127.0.0.1:5175/guide/skills' http://localhost:3456/new | python3 -c 'import json,sys;print(json.load(sys.stdin)["targetId"])')
sleep 4
```

辅助函数（每次搜索用）：唤起搜索框 → 填词 → 等结果：

```bash
search_word() {
  curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d '(() => { const btn = document.querySelector(".VPNavBarSearch button"); if (btn) btn.click(); return "opened" })()' >/dev/null
  sleep 1
  curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d '(() => { const input = document.querySelector(".VPLocalSearchBox input"); if (!input) return "NO INPUT"; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "'"$1"'"); input.dispatchEvent(new Event("input", { bubbles: true })); return "typed" })()' >/dev/null
  sleep 1
  curl -s -X POST "http://localhost:3456/eval?target=$TARGET" -d 'JSON.stringify({results: document.querySelectorAll(".VPLocalSearchBox .result").length, lis: document.querySelectorAll(".VPLocalSearchBox .results li").length})'
}
```

断言 1（正文中文词）：`search_word "表格增强"` → `results` 或 `lis` ≥ 1
断言 2（菜单名）：`search_word "技能列表"` → ≥ 1
断言 3（英文回归）：`search_word "vitepress"` → ≥ 1

若 `.result` 与 `.results li` 均为 0：先跑选择器探测 `document.querySelector(".VPLocalSearchBox")?.className` 与其 innerHTML 前 200 字符定位真实结果选择器，再按实际结构复测（UI 类名以实站为准，判定标准是"结果面板出现命中条目"）。

清理：`curl -s "http://localhost:3456/close?target=$TARGET"`

- [ ] **Step 4: 提交**

```bash
git add docs/.vitepress/config.mts
git commit -m "feat(docs): 站内搜索 — local search + 中文二元分词，可搜菜单名与正文"
```

---

### Task 2: 技能固化（SKILL.md 模板 + 重装）

**Files:**
- Modify: `skills/vitepress-doc-site/SKILL.md`（第 4 节 config 模板、常见问题表）

**Interfaces:**
- Consumes: Task 1 的 config search 块与 `tokenizeSearchText` 函数（逐字进入模板）
- Produces: `~/.claude/skills/vitepress-doc-site/SKILL.md` 为最新版

- [ ] **Step 1: 更新第 4 节 config 模板**

SKILL.md 第 4 节 config 模板的 `themeConfig` 内（`outline` 行之后）插入 search 块 + 模板前加函数定义（与 Task 1 Step 1 代码逐字一致，含中文注释），并在模板代码块前的说明文字补一句：「内置中文分词的站内搜索（local search），导航栏搜索框/⌘K 唤起」。

- [ ] **Step 2: 常见问题表加一行**

在表格末尾追加：

```markdown
| 站内搜索中文搜不到 | 模板已内置二元分词 tokenize；自写配置必须给 miniSearch 注入 tokenize，否则中文整句是单 token 永远搜不到 |
```

- [ ] **Step 3: 一致性校验 + 重装**

```bash
grep -c "tokenizeSearchText" skills/vitepress-doc-site/SKILL.md   # Expected: ≥2
node bin/cli.js add vitepress-doc-site                            # Expected: [claude]/[dsh] 各一行 ✓
diff ~/.claude/skills/vitepress-doc-site/SKILL.md skills/vitepress-doc-site/SKILL.md && echo SAME
```

- [ ] **Step 4: 提交**

```bash
git add skills/vitepress-doc-site/SKILL.md
git commit -m "feat(skills): vitepress-doc-site 固化站内搜索与中文分词模板"
```

---

## 自审记录

- **Spec 覆盖**：§2.1 config+分词 → Task 1 Step 1；§2.2 菜单名 → Task 1 断言 2；§2.3 SKILL.md → Task 2；§3 四项验证 → Task 1 Step 2/3 + Task 2 Step 3；§4 范围外未混入。
- **占位符**：无；分词函数与 config 块全文给出；选择器容错探测有明确动作。
- **一致性**：`tokenizeSearchText` 命名在 Task 1/2 一致；端口 5175 与 Global Constraints 一致。
