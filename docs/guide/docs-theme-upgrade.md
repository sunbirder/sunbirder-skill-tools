# docs-theme-upgrade

将已有 VitePress 文档站升级到最新主题模板（布局皮肤/表格增强/自动侧栏/中文搜索）。

## 触发条件

- 用户说 "把旧文档站升级到新主题"
- 用户说 "给这个文档站加上布局皮肤/表格增强"
- 用户说 "旧项目的 web 文档同步一下最新能力"

## 功能

只动主题层与配置，文档内容零改动：

1. 现状检测：确认 `docs/.vitepress/` 存在（否则转 vitepress-doc-site 全新搭建）；识别旧主题形态
2. 原样照抄替换：删旧 `theme/custom.css`，覆盖五件套（index.ts/layout.css/tables.css/enhance-tables.ts/enhance-layout.ts），可选加 auto-sidebar.mjs
3. config 对齐：中文分词 tokenize + optimizeDeps.include
4. 验收：清缓存重启 + build 成功 + **真浏览器验证**（面板开关、宽屏侧栏钉宽、表格 ⤢ 弹窗、中文搜索命中）
5. 收尾：提交并推送

## 输出结构（升级后）

```
project/
└── docs/.vitepress/
    ├── config.ts          # 补齐分词 + optimizeDeps
    ├── auto-sidebar.mjs   # 可选：文件夹结构即菜单
    └── theme/
        ├── index.ts           # 主题入口
        ├── layout.css         # 布局皮肤
        ├── tables.css         # 表格增强样式
        ├── enhance-tables.ts  # 表格增强脚本
        └── enhance-layout.ts  # 面板显隐开关
```

## 示例

```bash
/skill:docs-theme-upgrade /path/to/old-project
```

## 注意

- 主题选择器按 VitePress 1.6.4 实测，其他版本必须真浏览器重验
- 旧站自定义 CSS 与新 layout.css 冲突时，优先让旧样式改作用于更具体的容器
- 双实例坑：启动前 `ps aux | grep "vitepress dev"` 查重
