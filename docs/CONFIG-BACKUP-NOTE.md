# 📋 配置备份说明

## ⚠️ 重要安全提示

**此目录 (`~/.openclaw/configs/`) 包含敏感配置信息，不应该提交到 Git 仓库！**

### 包含的敏感信息
- 阿里云 AccessKey ID 和 Secret
- DashScope API Key
- OpenClaw 配置

---

## 🔐 正确的备份方式

### 方案 1：本地备份（推荐）
配置文件已保存在：
```
~/.openclaw/configs/
```

### 方案 2：加密后云存储
```bash
# 加密备份
gpg -c ~/.openclaw/configs/aliyun-config-*.json
gpg -c ~/.openclaw/configs/openclaw-config-*.json

# 然后上传到云存储
```

### 方案 3：物理备份
```bash
# 复制到 USB 驱动器
cp -r ~/.openclaw/configs/ /mnt/usb/backup/
```

---

## 📝 可以提交到 Git 的文件

以下文件**可以**安全提交：

- ✅ `README.md` - 配置说明（不含敏感信息）
- ✅ `CONFIG-BACKUP-GUIDE.md` - 备份指南
- ✅ `backup-config.sh` - 备份脚本
- ✅ `restore-config.sh` - 恢复脚本

---

## ❌ 不应该提交到 Git 的文件

以下文件**绝对不能**提交：

- ❌ `*.json` - 包含 AccessKey 和 API Key
- ❌ `ALIYUN-CREDENTIALS.md` - 包含完整凭证信息

---

## 🔄 配置恢复流程

如果配置丢失：

1. **从本地备份恢复**
```bash
~/.openclaw/configs/restore-config.sh
```

2. **或手动重新配置**
```bash
# 查看文档获取 AccessKey
cat docs/CONFIG-TEMPLATE.md

# 配置阿里云 CLI
aliyun configure set YOUR_KEY_ID YOUR_KEY_SECRET cn-hangzhou json
```

---

## 📖 相关文档

查看完整配置指南：
```bash
cat ~/.openclaw/configs/CONFIG-BACKUP-GUIDE.md
```

---

*创建时间：2026-06-01*  
*安全级别：⚠️ 敏感*
