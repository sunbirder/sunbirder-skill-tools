---
name: wxapkg-unpack
description: 解密并反编译微信小程序 wxapkg 包（V1MMWX 加密格式）— 解密、提取文件、还原为可读工程目录。适用于分析本地微信缓存中的小程序代码
---

# 微信小程序 wxapkg 解包与反编译

将本地微信缓存中的 `.wxapkg` 小程序包解密、解包，并还原为可读性良好的工程目录。

## 前置知识：V1MMWX 加密格式

微信 PC 端缓存的 wxapkg 是 V1MMWX 加密格式，结构：

```
"V1MMWX"(6B) + AES-256-CBC(原始文件前1024B) + XOR(其余全部)
```

**关键结论：解密材料全部来自 AppID 文件名本身，不需要微信账号 wxid**：

- AES 密钥：`PBKDF2-SHA1(appid, "saltiest", 1000, 32)`，IV 固定 `"the iv: 16 bytes"`
- XOR 密钥：`ord(appid[-2])`（AppID 倒数第二个字符的 ASCII 码）
- 拼接：`明文 = AES解密(前1024B)[:1023] + XOR解码(其余)`（注意是 1023 不是 1024）
- 校验：明文第 1 字节 = `0xBE`，第 14 字节 = `0xED`

明文即标准 wxapkg 容器（0xBE 头），内含文件索引（`nameLen(u32BE) + name + foff(u32BE) + fsize(u32BE)`）与数据。

## 工具链

| 工具 | 用途 | 位置/安装 |
|---|---|---|
| Python 脚本 | V1MMWX 解密 + 文件提取（仅标准库 + pycryptodome） | 本技能内嵌源码，按需写入临时目录 |
| KillWxapkg | 反编译还原（WXML/WXSS/工程目录结构） | `go build` 源码构建，见下文 |

### KillWxapkg 构建说明

GitHub Release 的 darwin 二进制有两个问题：被 macOS AppleSystemPolicy 拦截（`Killed: 9`），且 UPX 加壳无法用 `upx -d` 解开。**必须从源码构建**：

```bash
# 下载源码 (clone 慢时用 codeload tarball)
curl -sL -o /tmp/kwx.tar.gz "https://codeload.github.com/Ackites/KillWxapkg/tar.gz/refs/tags/v2.4.1"
mkdir -p ~/wxtools && cd ~/wxtools && tar xzf /tmp/kwx.tar.gz
cd KillWxapkg-2.4.1 && go build -o ../killwxapkg-bin .
~/wxtools/killwxapkg-bin --help   # 验证
```

参数：`-in <wxapkg> -id <appid> -out <dir> -pretty -restore -save`
（`-save` 会把解密后的 wxapkg 留在输出目录，分析完可删）

## 执行流程

### 第一步：定位包文件

微信小程序缓存在：

```
~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/users/<用户哈希>/applet/packages/<appid>/<版本>/<包名>.wxapkg
```

包类型（按重要性）：
- `__APP__.wxapkg` — 主包（必分析）
- `_pages_xxx_.wxapkg` / `_packageXxx_.wxapkg` — 分包
- `__PLUGINCODE__.wxapkg` — 插件包
- 顶层的纯数字 `.wxapkg`（如 `90.wxapkg`）— 版本容器，可能内嵌多个子包

同一个小程序有多个版本目录时，取数字最大的版本。

### 第二步：批量解密

对每个 V1MMWX 包执行解密（先单包验证，再批量）：

```python
#!/usr/bin/env python3
"""V1MMWX 解密 — 密钥全部来自 AppID，无需 wxid"""
from pathlib import Path
from hashlib import pbkdf2_hmac
from Crypto.Cipher import AES   # pip install pycryptodome

def decrypt_v1mmwx(path, appid):
    data = Path(path).read_bytes()
    if data[:6] != b'V1MMWX':
        return None                              # 已是明文包
    key = pbkdf2_hmac('sha1', appid.encode(), b'saltiest', 1000, 32)
    head = AES.new(key, AES.MODE_CBC, b'the iv: 16 bytes').decrypt(data[6:1030])
    xor = ord(appid[-2])
    body = bytes(b ^ xor for b in data[1030:])
    return head[:1023] + body

# 调用：
d = decrypt_v1mmwx("wx35ec0083b1bdb7e9/40/__APP__.wxapkg", "wx35ec0083b1bdb7e9")
assert d and d[0] == 0xBE and d[13] == 0xED     # 校验通过 = 解密成功
Path("decrypted.wxapkg").write_bytes(d)
```

顶层纯数字容器包可能是**明文**（0xBE 开头），其内嵌的 `.wxapkg` 子包仍是 V1MMWX 加密，需逐个解密。

### 第三步：提取文件（不依赖 KillWxapkg 时）

明文包的索引在头部（`count = u32BE(明文[14:18])`，条目从偏移 18 开始），按索引切片写出即可。索引中的 `foff` 从包起始处计算（绝对偏移 = `foff`，无需加头部大小）。

备用方案：若索引解析失败（罕见），可 XOR 解码后用内容特征扫描（PNG magic / JSON 边界 / JS 特征）切分，但通常不需要。

### 第四步：KillWxapkg 反编译还原

```bash
~/wxtools/killwxapkg-bin -in decrypted.wxapkg -id <appid> -out <输出目录> -pretty -restore
```

产出为可读工程：`app.json`、`pages/**/*.wxml|wxss|js|json`、`project.config.json`、`app-service.js`（编译后业务逻辑）。

**已知限制**：
- 分包页面的 WXML 编译数据在分包 `page-frame.js` 的 `$gwx` 函数里，KillWxapkg 只解析主包的 `page-frame.html`，因此分包页面会输出为占位符（`<text>路径</text>`）。业务逻辑（app-service.js）不受影响
- 旧格式 AMD 打包（如部分历史版本）无 WXML 可还原，只有 WXSS/JS
- 小游戏（含 `game.js`）无 WXML/WXSS 概念，属正常

### 第五步：验证与识别

1. **完整性检查**：统计输出中 `*.png` 的文件头是否为 `\x89PNG`，非 0 坏图说明偏移有误
2. **识别小程序**：查 `app.json` 的 `navigationBarTitleText`、`app-service.js` 中的分享文案/域名，或比对 `applet/icon/<appid>.png` 图标
3. 汇总各包文件数、WXML 数、大小，向用户报告

## 输出约定

- 解密后的明文包 → 临时目录（如 `/tmp/wx-dec/`）
- 反编译产物 → `packages/wx-decompiled/<appid>/`（或用户指定目录）
- 分析文档 → 各包目录下的 `docs/` 或用户指定位置

## 排错

| 症状 | 原因 | 处理 |
|---|---|---|
| `Killed: 9` | AppleSystemPolicy 拦截未签名二进制 | 源码构建（见上文） |
| `bad decrypt` | 密钥错误 | 确认用的是 appid 而非 wxid 做 PBKDF2 |
| 头部校验失败（0xBE/0xED 不符） | 包被二次加密或非标格式 | 检查是否为顶层容器/插件包 |
| PNG 全部损坏 | 提取偏移基准错误 | 用 PNG magic 投票确定正确偏移 |
| WXML 全是占位符 | 页面在分包里 | 反编译对应分包；或接受限制读 app-service.js |
