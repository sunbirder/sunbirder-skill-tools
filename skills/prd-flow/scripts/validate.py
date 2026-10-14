#!/usr/bin/env python3
"""prd-flow PRD 确定性校验器。

用法:
    python validate.py <PRD路径> [更多PRD路径...]

对填写后的 05-PRD.md 做确定性检查（启发式，不是完备语法分析）：
  FAIL：必选章节缺失 / 残留未填占位符〈…〉 / 用户故事缺"以便" /
        单个故事 AC < 3 / P0 功能 > 5 / 某条 AC 出现多个 When /
        页面流转表引用了 IA 中不存在的 PGE
  WARN：模糊词（较快/较好/较快地/灵活/用户友好）/ 疑似实现细节（文件路径样式）/
        缺主任务页面流转表（wireflow）/ 8.0 IA 行缺「端」列 / pages/ 缺 index.md

退出码：有 FAIL → 1，否则 0。校验 FAIL 时不得向用户声称 PRD 已完成。
"""
from __future__ import annotations

import os
import re
import sys

SECTION_PATTERNS = [
    ("摘要", r"^#{1,3}\s*1\.\s*摘要"),
    ("问题陈述", r"^#{1,3}\s*2\.\s*问题陈述"),
    ("目标用户", r"^#{1,3}\s*3\.\s*目标用户"),
    ("背景与时机", r"^#{1,3}\s*4\.\s*背景与时机"),
    ("范围", r"^#{1,3}\s*5\.\s*范围"),
    ("成功指标", r"^#{1,3}\s*6\.\s*成功指标"),
    ("用户故事与验收标准", r"^#{1,3}\s*7\.\s*用户故事"),
    ("功能详述", r"^#{1,3}\s*8\.\s*功能详述"),
    ("非功能需求", r"^#{1,3}\s*9\.\s*非功能"),
    ("风险与预演", r"^#{1,3}\s*10\.\s*风险与预演"),
    ("待定问题", r"^#{1,3}\s*11\.\s*待定问题"),
]

PLACEHOLDER_RE = re.compile(r"〈[^〉]{1,60}〉")
STORY_RE = re.compile(r"作为.{0,60}(我想要|我想要能|我希望)")
FUZZY_WORDS = ["较快", "较好", "更快地", "灵活配置", "用户友好", "体验更好"]
IMPL_HINT_RE = re.compile(r"(src/\w+|\.tsx?|\.vue|\.py\b|localhost:\d+|POST /api/)")
WHEN_RE = re.compile(r"\bWhen\b")


def strip_fences(text: str) -> list[tuple[int, str]]:
    """返回 (行号, 行文本)；跳过代码围栏内的行。"""
    out, fence = [], False
    for i, line in enumerate(text.splitlines(), 1):
        if line.lstrip().startswith("```"):
            fence = not fence
            continue
        if not fence:
            out.append((i, line))
    return out


def validate(path: str) -> tuple[list[str], list[str]]:
    fails: list[str] = []
    warns: list[str] = []
    text = open(path, encoding="utf-8").read()
    lines = strip_fences(text)

    # 1) 必选章节
    for name, pat in SECTION_PATTERNS:
        if not any(re.match(pat, ln) for _, ln in lines):
            fails.append(f"缺少必选章节：{name}")

    # 2) 残留未填占位符（全角尖括号）
    leftover = [(i, PLACEHOLDER_RE.search(ln).group(0)) for i, ln in lines if PLACEHOLDER_RE.search(ln)]
    if leftover:
        sample = "；".join(f"L{i}{p}" for i, p in leftover[:5])
        fails.append(f"残留未填占位符 ×{len(leftover)}：{sample}（模板占位符必须替换为实际内容）")

    # 3) 用户故事块检查：作为…/以便…/AC 数量
    story_pos = [idx for idx, (_, ln) in enumerate(lines) if STORY_RE.search(ln)]
    for n, pos in enumerate(story_pos):
        end = story_pos[n + 1] if n + 1 < len(story_pos) else len(lines)
        block = lines[pos:end]
        lineno = block[0][0]
        body = "\n".join(ln for _, ln in block[:3])
        if "以便" not in body and "so that" not in body.lower():
            fails.append(f"L{lineno} 第{n + 1} 个用户故事缺少「以便/so that」（价值陈述）")
        ac_lines = [(i, ln) for i, ln in block if re.match(r"^\s*\d+\.", ln) and ("Given" in ln or "When" in ln or "Then" in ln)]
        if len(ac_lines) < 3:
            fails.append(f"L{lineno} 第{n + 1} 个用户故事只有 {len(ac_lines)} 条 AC（需 ≥3：happy+edge+negative）")
        for i, ln in ac_lines:
            if len(WHEN_RE.findall(ln)) > 1:
                fails.append(f"L{i} 一条 AC 含多个 When——应拆成多个故事")

    # 3b) 功能清单与页面规划（v2：分层结构）
    func_rows = [(i, ln) for i, ln in lines if re.match(r"^\|\s*F\d+", ln)]
    if not func_rows:
        fails.append("缺少功能清单（可排序总表）：应有「### 5.4 功能清单」节且含 F 编号行")
    page_rows = [(i, ln) for i, ln in lines if re.match(r"^\|\s*PGE-\d+", ln)]
    if not page_rows:
        fails.append("缺少信息架构与页面规划：应有「### 8.0」节且含 PGE 编号行")

    def dup(rows, label):
        ids = [re.match(r"^\|\s*((?:F|PGE-)\d+)", ln).group(1) for _, ln in rows]
        d = sorted({x for x in ids if ids.count(x) > 1})
        if d:
            fails.append(f"{label} 编号重复：{','.join(d)}")
    dup(func_rows, "功能清单 F 编号")
    dup(page_rows, "页面 PGE 编号")

    # 3c) 头部版本行（前 12 行内）
    head = "\n".join(ln for i, ln in lines if i <= 12)
    if not re.search(r"当前版本：v", head):
        fails.append("头部缺少「当前版本：v…」行（与 _状态.md 一致）")

    # 3d) 页面设计覆盖：8.0 IA 的 PGE ↔ 同目录 pages/ 文件（v2.1）
    pge_ids = [re.match(r"^\|\s*(PGE-\d+)", ln).group(1) for _, ln in page_rows]
    if pge_ids:
        pages_dir = os.path.join(os.path.dirname(os.path.abspath(path)), "pages")
        if os.path.isdir(pages_dir):
            if "index.md" not in os.listdir(pages_dir):
                warns.append("pages/ 缺 index.md（页面清单 + 公共组件清单，模板 pages-index.md）")
            missing = [p for p in pge_ids
                       if not any(f.startswith(p) for f in os.listdir(pages_dir) if f.endswith(".md"))]
            if missing:
                fails.append(f"页面设计缺失：IA 中 {','.join(missing)} 在 pages/ 无对应文件（每页一份页面设计）")
        else:
            warns.append("8.0 已规划页面但尚无 pages/ 目录——建议为每个 PGE 生成页面设计描述")

    # 3e) 主任务页面流转（wireflow，v2.2）：序列中引用的 PGE 必须存在于 IA
    flow_rows = [(i, ln) for i, ln in lines
                 if ln.lstrip().startswith("|") and "→" in ln and re.search(r"PGE-\d+", ln)]
    if flow_rows:
        for i, ln in flow_rows:
            bad = sorted({p for p in re.findall(r"PGE-\d+", ln) if p not in pge_ids})
            if bad:
                fails.append(f"L{i} 页面流转引用了 IA 中不存在的页面：{','.join(bad)}（wireflow 序列只能用 8.0 已定义的 PGE）")
    elif pge_ids:
        warns.append("8.0 缺少主任务页面流转表（wireflow）——每条 P0 主任务一行「任务 | 关联故事 | 页面序列」")

    # 3f) 8.0 IA 端列（v2.2，WARN）：| 编号 | 页面 | 路由 | 端 | …
    if page_rows:
        bad_duan = []
        for i, ln in page_rows:
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            if len(cells) < 8 or not cells[3] or cells[3].startswith("〈"):
                bad_duan.append(f"L{i}")
        if bad_duan:
            warns.append(f"8.0 IA 有 {len(bad_duan)} 行缺「端」列或未填端（{'、'.join(bad_duan[:5])}）——端 = web/移动/小程序，来自 02 角色表")

    # 4) P0 数量（范围表格行）
    p0 = [i for i, ln in lines if re.match(r"^\|\s*F\d+", ln) and "P0" in ln]
    if len(p0) > 5:
        fails.append(f"P0 功能 {len(p0)} 条 > 5（追问：砍掉哪条仍可用？）")

    # 5) 模糊词（WARN）
    for i, ln in lines:
        for w in FUZZY_WORDS:
            if w in ln:
                warns.append(f"L{i} 模糊词「{w}」→ 换成可量化数字")
                break

    # 6) 疑似实现细节（WARN）
    for i, ln in lines:
        if IMPL_HINT_RE.search(ln):
            warns.append(f"L{i} 疑似实现细节（PRD 不写文件路径/API/端口）")
            break

    return fails, warns


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2
    total_fail = 0
    for path in argv:
        fails, warns = validate(path)
        total_fail += len(fails)
        print(f"== {path}")
        for f in fails:
            print(f"  [FAIL] {f}")
        for w in warns:
            print(f"  [WARN] {w}")
        if not fails and not warns:
            print("  全部通过 ✅")
        print(f"  结果：{'FAIL' if fails else 'PASS'}（{len(fails)} FAIL / {len(warns)} WARN）")
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
