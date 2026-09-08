---
name: disk-clean
description: 当 macOS 磁盘空间不足需要清理时使用 — 系统盘可用空间告急、"磁盘几乎已满"提示、清理缓存、释放磁盘空间。用户要求"清理磁盘"、"磁盘不足"时适用
---

# macOS 磁盘清理

系统性排查并释放磁盘空间。核心原则：**先量化再动手**——每一项删除前 `du -sh` 确认大小，删除后 `df -h` 验证增量；用户数据一律不动，拿不准的列清单交给用户决定。

## 流程

### 第一步：确认现状

```bash
df -h /    # 系统盘（/System/Volumes/Data 是实际数据卷）
```

### 第二步：大项排查（按产出排序，约 2 分钟）

```bash
# 用户级大目录
du -sh ~/Library/Caches ~/Library/Developer ~/Downloads ~/.Trash ~/Library/Logs 2>/dev/null

# 散落大文件 —— 最容易被漏掉的一项（崩溃转储、镜像、模型文件）
find ~ -maxdepth 2 -type f -size +500M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}'

# dotfile 目录里的大日志（~/Library/Logs 看不到它们）
find ~ -maxdepth 3 -name "*.log" -size +100M 2>/dev/null

# Docker（构建缓存经常是隐形大头，可达 30GB+）
docker system df 2>/dev/null
```

陷阱：
- `du` 整个 `~` 会超时（尤其网络盘、大目录），必须用 `maxdepth` 或指定子目录逐个看
- `sudo -n` 不可用时跳过系统目录，不要交互卡住

### 第三步：安全项——直接清理（已验证）

| 目标 | 命令 | 说明 |
|------|------|------|
| Java/IDE 崩溃转储 | `rm -f ~/java_error_in_*.hprof` | 单个可达 3G+，纯垃圾 |
| 无上限增长的日志 | `rm -f ~/.pip/pip.log ~/.hexhub-cn/*.log`（先 `find` 确认） | 按 `-size +100M` 筛选 |
| iOS 模拟器缓存 | `xcrun simctl shutdown all; rm -rf ~/Library/Developer/CoreSimulator/Caches/*` | 只删 Caches，**不删 Devices**（含模拟器数据） |
| 包管理缓存 | `pnpm store prune`、`brew cleanup --prune=all`、`rm -rf ~/Library/Caches/{Homebrew,pip,electron,utools-updater,ms-playwright}/*` | 全部可再生 |
| Docker 构建缓存 | `docker builder prune -af`，再 `docker image prune -af` 清悬空镜像 | 不影响运行中容器和保留的镜像 |
| 日志 | `find ~/Library/Logs -type f -mtime +30 -delete` | 只删 30 天前 |

清完每个安全项后 `df -h /` 复测增量。

### 第四步：需用户确认项——列清单等决定

这些删了能重建，但代价是重新下载/重新配置，或者含个人数据：

- **`~/.m2`、`~/.gradle/caches`、`~/go/pkg/mod`**：构建依赖，重下要几十 GB 流量
- **`~/Library/Caches/JetBrains`、`Google`**：IDE 索引/浏览器缓存，删后首次打开慢
- **`~/Downloads` 大文件/目录**：用户文件，只列清单绝不代删
- **`docker images`**：列出后让用户挑不用的（有容器在跑的镜像不能删）
- **APFS 本地快照**：`tmutil listlocalsnapshots /` 查看，只报告不删

### 红线——永远不碰

- `/System`、`/private/var/folders`、`/Library/Updates`（系统更新进行中会损坏）
- `~/Library/Application Support`（应用用户数据/聊天记录，丢了不可再生）
- 任何 `sudo rm -rf` 通配路径

## 已知陷阱

- **APFS 空间延迟回收**：`docker builder prune` 报告释放 13G 但 `df` 可能不变——APFS 异步回收，等几秒到几分钟再复测，不要因此重复删除
- **`.hprof` 在 home 根目录**不在任何缓存目录里，漏跑 `find` 就永远找不到它
- **废纸篓**：Finder 删除的文件仍在 `~/.Trash` 占空间，`du -sh ~/.Trash` 确认后可清空
