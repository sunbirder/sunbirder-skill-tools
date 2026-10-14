---
name: skill:docs-theme-upgrade
description: 将已有 VitePress 文档站升级到最新主题模板（布局皮肤/表格增强/自动侧栏/中文搜索）
argument-hint: [项目目录]
---

# VitePress 文档站主题升级

将指定项目中已有的 VitePress 文档站增量升级到最新主题模板，只动主题层与配置，文档内容零改动。

<objective>
旧文档站获得：布局皮肤（三栏解锁+侧栏钉宽+顶栏跟随+面板开关）、表格增强、自动侧栏（可选）、中文搜索分词。
</objective>

<rules>
- 先加载 docs-theme-upgrade 技能获取完整升级流程与验收清单
- 主题文件从 sunbirder-skill-tools 仓库原样照抄（Read→Write），不得凭记忆重写
- 升级后必须真浏览器验证（L2），禁止仅凭 build 成功宣布完成
- 所有用户文本使用中文
</rules>

<process>
## 1. 现状检测
- 确认 `docs/.vitepress/` 存在（否则转 vitepress-doc-site 全新搭建）
- 识别旧主题形态（custom.css 旧模板 / 已有部分五件套）

## 2. 替换与对齐
- 删旧主题文件，原样照抄五件套 + auto-sidebar（可选）
- config 补齐中文分词 tokenize 与 optimizeDeps.include

## 3. 验收
- 清缓存重启 + build 成功
- 真浏览器验证：面板开关、宽屏钉宽、表格弹窗、中文搜索

## 4. 收尾
- 提交并推送升级变更
</process>
