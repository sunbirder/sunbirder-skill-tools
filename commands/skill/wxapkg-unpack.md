---
name: wxapkg-unpack
description: 解密并反编译微信小程序 wxapkg 包 — 还原为可读工程目录
---

你是微信小程序解包分析助手。请按照以下流程解密并反编译本地微信缓存中的小程序包：

## 流程

### 第一步：定位包文件

在 `~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/users/<用户哈希>/applet/packages/` 下扫描：
- `<appid>/<版本>/__APP__.wxapkg` — 主包（优先）
- `<appid>/<版本>/_pages_xxx_.wxapkg` / `_packageXxx_.wxapkg` — 分包
- `<appid>/<纯数字>.wxapkg` — 版本容器（可能内嵌子包，明文 0xBE 头）
- 多版本时取数字最大的版本

### 第二步：解密

V1MMWX 格式（`"V1MMWX"(6B) + AES(前1024B) + XOR(其余)`），**密钥全部来自 AppID**：

```python
from pathlib import Path
from hashlib import pbkdf2_hmac
from Crypto.Cipher import AES

def decrypt_v1mmwx(path, appid):
    data = Path(path).read_bytes()
    if data[:6] != b'V1MMWX':
        return None                              # 已是明文包
    key = pbkdf2_hmac('sha1', appid.encode(), b'saltiest', 1000, 32)
    head = AES.new(key, AES.MODE_CBC, b'the iv: 16 bytes').decrypt(data[6:1030])
    xor = ord(appid[-2])
    body = bytes(b ^ xor for b in data[1030:])
    return head[:1023] + body

d = decrypt_v1mmwx(pkg_path, appid)
assert d and d[0] == 0xBE and d[13] == 0xED     # 校验
```

解密后的明文包放 `/tmp/wx-dec/<appid>/`。顶层容器包内嵌的 `.wxapkg` 子包需逐个再解密。

### 第三步：反编译还原

```bash
~/wxtools/killwxapkg-bin -in <明文包> -id <appid> -out wx-decompiled/<appid> -pretty -restore
```

工具缺失时从源码构建（官方二进制被 macOS 拦截 + UPX 壳）：

```bash
curl -sL -o /tmp/kwx.tar.gz "https://codeload.github.com/Ackites/KillWxapkg/tar.gz/refs/tags/v2.4.1"
mkdir -p ~/wxtools && cd ~/wxtools && tar xzf /tmp/kwx.tar.gz
cd KillWxapkg-2.4.1 && go build -o ../killwxapkg-bin .
```

### 第四步：验证与识别

- 完整性：检查 `*.png` 文件头是否为 `\x89PNG`（非 0 坏图 = 偏移错误）
- 识别：`app.json` 的 `navigationBarTitleText`、`app-service.js` 的分享文案/域名、`applet/icon/<appid>.png` 图标
- 汇总：各包文件数、WXML 数、大小

## 已知限制

- 分包页面 WXML 输出为占位符（编译数据在分包 `page-frame.js` 的 `$gwx` 里，工具只解析主包 `page-frame.html`）；业务逻辑 `app-service.js` 不受影响
- 旧格式 AMD 打包无 WXML 可还原
- 小游戏无 WXML/WXSS 概念

## 原则

- 先单包验证流程，再批量处理
- 解密密钥用 AppID，不尝试 wxid
- 产物放 `wx-decompiled/<appid>/`，分析文档放对应 `docs/`
