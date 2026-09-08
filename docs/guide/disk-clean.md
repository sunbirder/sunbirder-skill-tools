# disk-clean

macOS 磁盘清理 — 系统性排查大项、清理可再生缓存、大文件清单交用户决定。

## 触发条件

- 输入 `/skill:disk-clean`
- 说 "清理磁盘"、"磁盘不足"、"磁盘空间不够"、"释放磁盘空间"

## 流程

1. **确认现状** — `df -h /` 查看系统盘可用空间
2. **大项排查** — `du` 检查用户级大目录（Caches/Developer/Downloads/Trash/Logs）；`find ~ -maxdepth 2 -size +500M` 找散落大文件（崩溃转储 .hprof、iso、模型文件等最易漏掉）；`docker system df` 查构建缓存（隐形大头，可达 30GB+）
3. **安全项直接清理** — 崩溃转储、超大日志、iOS 模拟器缓存（只删 Caches 不删 Devices）、包管理缓存（pnpm/brew/pip/electron/ms-playwright）、Docker 构建缓存；每项删前 `du -sh` 确认、删后 `df -h` 验证
4. **需确认项列清单** — `~/.m2`/`~/.gradle`/`~/go/pkg/mod`（重下流量大）、JetBrains/Google 缓存、`~/Downloads` 大文件、`docker images`，列清单交用户决定

## 已知陷阱

- **APFS 延迟回收**：prune 后 `df` 暂不变是正常的，等几秒再复测，不要重复删除
- **散落大文件**：`.hprof` 等在 home 根目录，不在任何缓存目录里，漏跑 `find` 就找不到
- **du 超时**：必须限 `maxdepth` 或逐个子目录，整盘扫会超时
- **红线**：不碰 `/System`、`/private/var/folders`、`/Library/Updates`、`~/Library/Application Support`

## 实测数据（2026-09 验证）

崩溃转储 5.6G + Docker 构建缓存 13.6G + 模拟器缓存 5.6G + 包管理缓存 4G + 大日志 1.4G ≈ 30G 释放（系统盘 1.3G 可用 → 24G）。
