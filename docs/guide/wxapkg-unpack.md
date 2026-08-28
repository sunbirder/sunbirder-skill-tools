# wxapkg-unpack

解密并反编译微信小程序 wxapkg 包，还原为可读工程目录。

## 触发条件

- 输入 `/skill:wxapkg-unpack`
- 说 "解包小程序"、"反编译 wxapkg"、"分析微信小程序缓存"

## 背景

微信 PC 端缓存的小程序包是 V1MMWX 加密格式。核心结论：**解密材料全部来自 AppID 文件名本身，不需要微信账号 wxid**：

- AES 密钥：`PBKDF2-SHA1(appid, "saltiest", 1000, 32)`，IV 固定
- XOR 密钥：`ord(appid[-2])`（AppID 倒数第二个字符）
- 拼接：`明文 = AES头[:1023] + XOR区`，校验 `0xBE`/`0xED` 头

## 流程

1. **定位包文件** — 扫描 `~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/users/<用户哈希>/applet/packages/<appid>/<版本>/`，主包 `__APP__.wxapkg` 优先，多版本取最大号
2. **批量解密** — Python（pycryptodome）解密到 `/tmp/wx-dec/<appid>/`，逐包校验 `0xBE`/`0xED`；顶层容器包内嵌子包需再解密
3. **反编译还原** — KillWxapkg（源码构建于 `~/wxtools/killwxapkg-bin`）输出 WXML/WXSS/JS 工程目录到 `wx-decompiled/<appid>/`
4. **验证与识别** — PNG 文件头完整性检查；通过 `app.json` 标题、分享文案、图标识别小程序身份

## 已知限制

- 分包页面 WXML 输出为占位符（编译数据在分包 `page-frame.js` 的 `$gwx` 里，工具只解析主包 `page-frame.html`）；业务逻辑 `app-service.js` 不受影响
- 旧格式 AMD 打包无 WXML 可还原；小游戏无 WXML/WXSS 概念

## 依赖

- Python 3 + `pycryptodome`（解密）
- Go 1.23+（构建 KillWxapkg，一次性）
- 首次使用需构建工具，技能内含完整构建命令
