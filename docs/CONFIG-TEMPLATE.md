# 🔧 OpenClaw 配置模板

**⚠️ 注意**：这是一个模板文件，不包含真实的 AccessKey。

---

## 📋 配置说明

### 阿里云 CLI 配置

配置位置：`~/.aliyun/config.json`

配置模板：
```json
{
  "profiles": [
    {
      "name": "default",
      "mode": "AK",
      "access_key_id": "YOUR_ACCESS_KEY_ID",
      "access_key_secret": "YOUR_ACCESS_KEY_SECRET",
      "region_id": "cn-hangzhou",
      "output_format": "json"
    }
  ]
}
```

### 获取 AccessKey 的步骤

1. 访问阿里云 RAM 控制台：https://ram.console.aliyun.com/users
2. 登录账号
3. 找到对应用户 → 认证管理
4. 创建 AccessKey
5. 保存 AccessKey ID 和 Secret

### 配置命令

```bash
aliyun configure set YOUR_KEY_ID YOUR_KEY_SECRET cn-hangzhou json
```

---

## 🔐 OpenClaw 配置

配置位置：`~/.openclaw/openclaw.json`

包含的配置：
- DashScope API Key
- 模型配置
- Agent 配置
- 插件配置

---

## 📁 配置文件备份

备份位置：`~/.openclaw/configs/`

### 备份脚本
```bash
~/.openclaw/configs/backup-config.sh
```

### 恢复脚本
```bash
~/.openclaw/configs/restore-config.sh
```

---

## 🚀 快速开始

### 1. 获取 AccessKey
在阿里云 RAM 控制台创建

### 2. 配置阿里云 CLI
```bash
aliyun configure set LTAI... YOUR_SECRET cn-hangzhou json
```

### 3. 验证配置
```bash
aliyun configure list
aliyun bssopenapi QueryAccountBalance
```

### 4. 备份配置
```bash
~/.openclaw/configs/backup-config.sh
```

---

## 📖 详细文档

- 配置备份指南：`~/.openclaw/configs/CONFIG-BACKUP-GUIDE.md`
- 配置说明：`~/.openclaw/configs/README.md`
- 阿里云凭证：`~/.openclaw/configs/ALIYUN-CREDENTIALS.md`（⚠️ 敏感）

---

## ⚠️ 安全提示

1. **不要提交敏感文件到 Git**
   - `*.json` 配置文件
   - `ALIYUN-CREDENTIALS.md`
   
2. **定期轮换 AccessKey**
   - 建议每 90 天更换一次

3. **使用最小权限原则**
   - 只授予必要的权限（如 `AliyunBSSReadOnlyAccess`）

4. **备份到安全位置**
   - 本地备份：`~/.openclaw/configs/`
   - 加密云存储
   - USB 驱动器

---

*模板版本：1.0*  
*创建时间：2026-06-01*  
*最后更新：2026-06-01*
