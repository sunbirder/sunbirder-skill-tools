---
name: docs-all-in-one
description: 一站式 web 文档 — 一条命令完成项目文档生成（doc-gen）+ VitePress 文档站搭建（vitepress-doc-site）+ 启动预览。适用于新项目从零建立完整文档站
---

# 一站式 Web 文档

组合 `doc-gen` 与 `vitepress-doc-site` 两个技能的能力：一次性完成项目分析、文档集生成、文档站搭建、启动预览。

## 执行前

先加载两个技能获取完整细节：

- `doc-gen` — 文档集生成流程、图表硬性要求、完整性自检
- `vitepress-doc-site` — 文档站搭建模板（端口分配、配置、Mermaid 支持）

## 流程

### 第一步：项目分析 + 枚举清单（来自 doc-gen）

全面扫描项目，输出三份清单：

1. **开发流程清单** — 生命周期每个流程（初始化、开发、构建、测试、发布、部署…）
2. **功能/业务流程清单** — 每个核心功能一份
3. **模块清单** — 架构图依据

### 第二步：确定文档清单（来自 doc-gen）

**一个流程一份文档，禁止堆进同一份文档。** 分类出清单让用户确认：

- 总览类 — 项目概述、架构总览、目录结构
- 开发流程类 — 每个流程独立一份（按项目实际裁剪）
- 功能流程类 — 每个核心功能独立一份
- 参考类 — API/命令参考、配置说明、FAQ

### 第三步：搭建文档站骨架（来自 vitepress-doc-site）

文档生成前先把站点骨架建好，后续文档直接写入 `docs/`：

1. **端口分配** — 从 5173 开始间隔 10 找空闲端口：
   ```bash
   PORT=5173
   while lsof -i :$PORT &>/dev/null; do PORT=$((PORT + 10)); done
   echo $PORT
   ```
2. 根目录 `package.json` 添加 devDependencies：`vitepress`、`vitepress-plugin-mermaid`、`mermaid`
3. `docs/package.json` — dev/build/preview 脚本，使用 `../node_modules/.bin/vitepress`，dev 固定分配的端口
4. `docs/.vitepress/config.ts` — 站点配置骨架，`withMermaid()` 包装（此时侧边栏先建分组框架）
5. `docs/index.md` — home layout 首页
6. `docs/.vitepress/theme/index.ts` — 主题扩展
7. `.gitignore` — 排除 `node_modules/`、`docs/.vitepress/dist/`、`docs/.vitepress/cache/`

已有文档站的项目跳过此步，只补充缺失部分。

### 第四步：逐份生成文档（来自 doc-gen）

按 总览 → 开发流程 → 功能流程 → 参考 的顺序，将文档写入 `docs/` 对应目录。

每份文档硬性要求：

1. **独立成篇** — 一份文档只讲一个流程/主题，相关内容拆分互链
2. **图表完整** — 每份至少一张 Mermaid 图，覆盖主流程 + 分支 + 异常路径（不能只画 happy path）：
   - 流程 → flowchart 流程图
   - 架构 → 模块架构图
   - 多方调用 → sequenceDiagram 时序图
   - 状态变化 → stateDiagram-v2 状态图
   - 数据模型 → erDiagram 实体关系图
3. **代码引用** — 关键描述带 `文件路径:行号`
4. **可运行示例**
5. **异常与边界** — 覆盖失败场景与排查方法

文档数量多时可分批生成、分批确认。

### 第五步：完整性自检 + 注册侧边栏（来自 doc-gen）

- 对照第二步清单逐项检查：每个流程都有独立文档、图表覆盖异常路径、文档互链
- 将所有文档按分类注册到 `docs/.vitepress/config.ts` 侧边栏（总览 / 开发流程 / 功能流程 / 参考 分组）

### 第六步：启动预览（来自 vitepress-doc-site）

```bash
cd docs && npm run dev
```

首次运行前需 `npm install`。启动后向用户报告访问地址（`http://localhost:<port>`）。

## 原则

- **一次到位** — 单条命令产出可浏览的完整文档站，不需要用户再手动搭站
- **独立成篇** — 宁多而细，不少而堆砌
- **图表优先** — 图覆盖主流程、分支与异常路径
- **以代码为准** — 基于实际代码，不凭空编造
- **已有文档先询问** — 已存在的文档站或文档，询问覆盖还是补充
