# Memory - 核心记忆

**最后更新**: 2026-06-01  
**维护方式**: 自动 + 手动

---

## ⚡ 快速提示 - 阿里云账单查询

**下次查询阿里云账单时，按以下步骤：**

1. **检查 CLI 配置**
   ```bash
   aliyun configure list
   ```

2. **查询余额**
   ```bash
   aliyun bssopenapi QueryAccountBalance
   ```

3. **查询交易记录**
   ```bash
   aliyun bssopenapi QueryAccountTransactions \
     --CreateTimeStart 2026-05-25T00:00:00Z \
     --CreateTimeEnd 2026-06-01T23:59:59Z
   ```

4. **如果配置丢失**
   - 查看：`~/.openclaw/configs/ALIYUN-CREDENTIALS.md`
   - 恢复：`~/.openclaw/configs/restore-config.sh`

5. **快速查询（推荐）**
   ```bash
   ~/lian2/scripts/check-alibaba.sh
   ```

---

## 🔑 关键配置

### 阿里云账号
- **主账号**: `feiyongchaxun@1382761172533899.onaliyun.com`
- **RAM 用户**: `power-application-user`
- **AccessKey ID**: `LTAI5tANc4yPGQYgcUTjKeFV`
- **Region**: `cn-hangzhou`
- **权限**: `AliyunBSSReadOnlyAccess`

### 配置保存位置
- **本地配置**: `~/.openclaw/configs/`
- **GitHub 仓库**: `github.com/albert20260208/lian2`
- **备份脚本**: `~/.openclaw/configs/backup-config.sh`

### 模型偏好
- **默认模型**: `dashscope/qwen3.5-plus`
- **备选模型**: `anthropic/claude-opus-20240229` (需配置)
- **搜索工具**: 优先使用 `searxng`

---

## 📅 最近摘要

### 2026-06-01
- ✅ 完成阿里云账单查询配置
- ✅ 创建 legal-assistant Agent（法律助手）
- ✅ 配置保存到 `~/.openclaw/configs/`
- ✅ 同步配置文档到 GitHub
- ✅ 创建 Memory 文件系统

### 2026-05-28
- ✅ 创建 lian2 Agent（编剧导演）
- ✅ 初始化 GitHub 仓库
- ✅ 配置 DashScope API

---

## ⚡ 快速规则

### 搜索
- 联网搜索优先使用 `searxng` skill
- web_search 作为备选

### 配置
- 敏感配置保存在 `~/.openclaw/configs/`
- 不要将 JSON 配置提交到 Git
- 每 90 天轮换 AccessKey

### 账单查询
- 使用 AccessKey 配置阿里云 CLI
- 命令：`aliyun bssopenapi QueryAccountBalance`
- 需要 `AliyunBSSReadOnlyAccess` 权限

### 文档
- 使用 Markdown 格式
- 中文命名 + 日期
- 保存到 `~/docs/` 目录

---

## 📊 当前状态

### Agent 状态
| Agent | 状态 | 用途 |
|-------|------|------|
| lian2 | ✅ 活跃 | 编剧导演创作 |
| legal-assistant | ✅ 活跃 | 法律合同起草 |
| main | ✅ 活跃 | 通用助手 |

### 阿里云状态
- **余额**: 65.40 CNY
- **5 月消费**: 311.79 CNY
- **状态**: ✅ 正常

### Git 状态
- **仓库**: github.com/albert20260208/lian2
- **分支**: main
- **最新提交**: 配置文档同步完成

---

## 🔗 相关文档

- **配置备份**: `~/.openclaw/configs/README.md`
- **项目笔记**: `docs/memory/02-project-notes.md`
- **决策记录**: `docs/memory/03-decisions.md`
- **学习记录**: `docs/memory/04-learnings.md`

---

*此文件由 OpenClaw 自动维护*
