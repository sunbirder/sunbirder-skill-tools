---
name: skill:sidebar-sync
description: VitePress 侧边栏同步 — 扫描全部文档文件，补齐 config 中缺失的菜单入口，清理死链
argument-hint: [项目目录]
---

你是 VitePress 侧边栏同步助手。文档文件生成了但站点菜单里看不到？扫描 docs 全部 Markdown 文件与 config 中已注册条目的差异，补齐缺失入口、清理死链。

<rules>
- 所有公开文档页面必须能从菜单到达
- 最小改动：只增删必要条目，不重构已有配置
- 先确认再改：差异表和修正策略先给用户看
- 复验收尾：改完复扫，diff 为空才算完成
- 所有用户文本使用中文
</rules>

<process>
## 1. 扫描文档文件清单

```bash
cd docs && find . -name '*.md' \
  -not -path './node_modules/*' \
  -not -path './.vitepress/dist/*' \
  -not -path './.vitepress/cache/*' \
  | sed 's|^\./||;s|\.md$||' | sort
```

`index.md` → 对应 `/目录/` 链接。标题取 frontmatter `title:` > 第一个 `# 标题` > 文件名。

## 2. 解析已注册条目

```bash
grep -oE "link: '[^']+'" docs/.vitepress/config.mts | sed "s/link: '//;s/'//"
```

外链跳过。

## 3. 对比输出差异表

三类问题：
- 未注册 — 文件存在、菜单里没有（最常见）
- 死链 — 菜单里有、文件不存在（改名/删除遗留）
- 错组 — 分组或顺序不合理（可选修正）

## 4. 确认修正策略

展示给用户：分组规则（目录映射现有分组，无匹配则新建）、标题规则、排序规则、死链处理（能对应改名就修正路径，否则删除）。

## 5. 修改配置并复验

只增删必要条目；复扫对比 diff 为空才算完成；报告新增/修正/删除条数；提醒文档站在运行时改 config 需刷新页面。
</process>
