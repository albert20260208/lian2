# 学习记录

**创建时间**: 2026-06-01  
**最后更新**: 2026-06-01

---

## 2026-06-01: 阿里云账单查询配置

### 问题
无法查询阿里云消费账单，API 返回错误

### 现象
```bash
aliyun bssopenapi QueryAccountBalance
# 返回错误：region can't be empty
```

### 原因分析
1. **阿里云 CLI 未配置**
   - 配置文件 `~/.aliyun/config.json` 不存在
   - 需要运行 `aliyun configure` 配置

2. **权限不足**
   - RAM 用户缺少 BSS 相关权限
   - 需要 `AliyunBSSReadOnlyAccess` 权限

3. **Key 类型混淆**
   - DashScope API Key (sk-xxx) 无法用于账单查询
   - 需要阿里云 AccessKey (LTAIxxx)

### 解决方案

#### 步骤 1: 创建 AccessKey
1. 访问 RAM 控制台
2. 找到对应用户
3. 创建 AccessKey
4. 保存 ID 和 Secret

#### 步骤 2: 添加权限
1. 在 RAM 控制台添加权限
2. 选择 `AliyunBSSReadOnlyAccess`
3. 确认授权

#### 步骤 3: 配置 CLI
```bash
aliyun configure set YOUR_ACCESS_KEY_ID YOUR_ACCESS_KEY_SECRET cn-hangzhou json
```

⚠️ **注意**: 真实的 AccessKey 保存在 `~/.openclaw/configs/`，不要提交到 Git

#### 步骤 4: 验证配置
```bash
aliyun configure list
aliyun bssopenapi QueryAccountBalance
```

### 结果
✅ 配置成功  
✅ 查询到余额：65.40 CNY  
✅ 查询到 5 月账单：311.79 CNY

### 教训
1. **Key 类型区分**
   - DashScope API Key: `sk-xxxxxxxx` (用于大模型)
   - 阿里云 AccessKey: `LTAI5tGk...` (用于云服务)

2. **权限最小化**
   - 只授予必要的权限
   - 账单查询只需 `AliyunBSSReadOnlyAccess`

3. **配置备份**
   - 配置完成后立即备份
   - 保存到安全位置

---

## 2026-06-01: 配置文件安全

### 问题
如何安全保存包含 AccessKey 的配置文件

### 风险
- AccessKey 泄露可能导致资源被盗用
- 误提交到 Git 会公开敏感信息
- 配置丢失需要重新配置

### 解决方案

#### 1. 文件权限
```bash
chmod 600 ~/.openclaw/configs/*.json
```

#### 2. Git 忽略
```gitignore
# 敏感配置
*.json
ALIYUN-CREDENTIALS.md
```

#### 3. 备份策略
- 本地备份：`~/.openclaw/configs/`
- 加密备份：使用 GPG 加密
- 异地备份：USB 或云存储

#### 4. 定期轮换
- 每 90 天更换 AccessKey
- 在 RAM 控制台删除旧 Key
- 创建新 Key 并更新配置

### 教训
1. **永远不要**将 AccessKey 提交到 Git
2. 使用最小权限原则
3. 定期轮换 Key
4. 备份到多个安全位置

---

## 2026-06-01: Agent 配置管理

### 问题
多个 Agent 配置混乱，难以管理

### 现象
- 配置文件分散在不同位置
- 不知道哪个配置是最新的
- 恢复配置困难

### 解决方案

#### 1. 统一配置目录
```
~/.openclaw/configs/
├── aliyun-config-*.json
├── openclaw-config-*.json
└── ...
```

#### 2. 备份脚本
```bash
~/.openclaw/configs/backup-config.sh
```

#### 3. 恢复脚本
```bash
~/.openclaw/configs/restore-config.sh
```

#### 4. 文档说明
- README.md: 快速入门
- CONFIG-BACKUP-GUIDE.md: 完整指南

### 教训
1. 配置文件集中管理
2. 提供简单的备份恢复工具
3. 文档要清晰完整

---

## 2026-05-28: Git 仓库初始化

### 问题
如何正确初始化 Git 仓库并保护敏感信息

### 教训

#### 1. .gitignore 配置
```gitignore
# 敏感文件
*.json
*.key
.env

# 配置目录
.openclaw/
configs/

# 日志
*.log
```

#### 2. 提交前检查
```bash
git status
git diff
```

#### 3. 敏感信息处理
- 使用模板文件代替真实配置
- 在文档中说明如何获取配置
- 提供配置脚本

### 最佳实践
1. 初始化时就设置好 .gitignore
2. 提交前仔细检查
3. 使用配置模板
4. 敏感信息本地保存

---

## 通用教训

### 配置管理
1. **集中保存**: 所有配置在一个目录
2. **权限控制**: 600 (文件) / 755 (脚本)
3. **定期备份**: 配置变更后立即备份
4. **异地存储**: 至少一份异地备份

### 安全实践
1. **最小权限**: 只授予必要的权限
2. **定期轮换**: 每 90 天更换密钥
3. **不提交 Git**: 敏感信息绝不提交
4. **加密存储**: 重要配置加密备份

### 文档记录
1. **及时记录**: 遇到问题立即记录
2. **详细过程**: 包含问题、原因、解决步骤
3. **可复用**: 他人可以按文档操作
4. **定期回顾**: 每月整理一次

---

*此文件记录所有遇到的问题和解决方案，避免重复犯错*
