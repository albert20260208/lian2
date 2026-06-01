# 项目笔记

**创建时间**: 2026-06-01  
**最后更新**: 2026-06-01

---

## 🎬 lian2 - 编剧导演 Agent

### 基本信息
- **创建时间**: 2026-05-28
- **所有者**: albert20260208
- **GitHub**: github.com/albert20260208/lian2
- **用途**: 剧本创作、分镜头设计、角色设定

### 目录结构
```
~/lian2/
├── docs/              ← 配置文件
├── skills/            ← 技能库
├── scripts/           ← 剧本草稿
├── projects/          ← 项目策划
├── templates/         ← 模板文件
└── .git/              ← Git 仓库
```

### 核心能力
- 剧本创作与修改
- 分镜头脚本设计
- 角色设定
- 拍摄计划
- 预算估算

### 常用命令
```bash
# 写一个 3 分钟短视频脚本
# 设计这个场景的分镜头
# 帮我完善角色设定
# 生成拍摄预算表
```

### 当前状态
- ✅ 已完成配置
- ✅ 已同步到 GitHub
- ✅ 配置文档已保存

---

## ⚖️ legal-assistant - 法律助手 Agent

### 基本信息
- **创建时间**: 2026-06-01
- **用途**: 合同起草、法律文档审核
- **配置位置**: `~/.openclaw/agents/legal-assistant/`

### 目录结构
```
~/legal-assistant/
├── templates/         ← 合同模板
├── drafts/            ← 草稿
└── completed/         ← 已完成
```

### 可用模板
1. **NDA-保密协议.md**
   - 用途：保密协议
   - 条款：保密义务、违约责任、争议解决

2. **技术服务协议.md**
   - 用途：技术服务合同
   - 条款：服务内容、费用、验收标准

### 核心能力
- 起草各类合同
- 审核合同条款
- 提供法律风险提示
- 管理合同模板库

### 当前状态
- ✅ 已完成配置
- ✅ 模板已创建
- ⏳ 待测试使用

---

## 💰 阿里云配置

### 账号信息
- **主账号**: `feiyongchaxun@1382761172533899.onaliyun.com`
- **RAM 用户**: `power-application-user`
- **AccessKey ID**: `LTAI5tANc4yPGQYgcUTjKeFV` ⚠️ **敏感信息，已保存到本地配置**
- **权限**: `AliyunBSSReadOnlyAccess`

⚠️ **安全提示**: 完整的 AccessKey 信息保存在 `~/.openclaw/configs/ALIYUN-CREDENTIALS.md`，不要提交到 Git

### 配置位置
- **CLI 配置**: `~/.aliyun/config.json`
- **备份位置**: `~/.openclaw/configs/`
- **GitHub 文档**: `lian2/docs/CONFIG-TEMPLATE.md`

### 当前状态
- **余额**: 65.40 CNY
- **5 月消费**: 311.79 CNY
- **状态**: ✅ 正常

### 主要消费项目 (5 月)
| 产品 | 金额 (CNY) | 类型 |
|------|-----------|------|
| 轻量应用服务器 | 149.00 | 包年包月 |
| 百炼知识库 (RAG) | 109.52 | 按量付费 |
| 百炼大模型推理 | 48.15 | 按量付费 |
| 百炼大模型训练 | 5.12 | 按量付费 |

### 常用命令
```bash
# 查询余额
aliyun bssopenapi QueryAccountBalance

# 查询交易记录
aliyun bssopenapi QueryAccountTransactions \
  --CreateTimeStart 2026-05-25T00:00:00Z \
  --CreateTimeEnd 2026-06-01T23:59:59Z

# 查询月度账单
aliyun bssopenapi QueryBill --BillingCycle 2026-05
```

---

## 🔧 OpenClaw 配置

### 系统信息
- **版本**: OpenClaw 2026.3.28
- **运行位置**: 阿里云 ECS (iZuf695rgxp4sa5a32in3sZ)
- **时区**: Asia/Shanghai
- **默认模型**: dashscope/qwen3.5-plus

### 配置管理
- **配置目录**: `~/.openclaw/configs/`
- **备份脚本**: `backup-config.sh`
- **恢复脚本**: `restore-config.sh`

### 已安装插件
- ✅ 飞书 (openclaw-lark)
- ✅ 企业微信 (wecom-openclaw-plugin)
- ✅ 钉钉 (dingtalk-connector)
- ✅ QQ 机器人 (openclaw-qqbot)
- ✅ 微信 (openclaw-weixin)

### 已安装技能
- ✅ feishu-bitable (多维表格)
- ✅ feishu-calendar (日历)
- ✅ feishu-task (任务)
- ✅ wecom-doc-manager (文档管理)
- ✅ wecom-schedule (日程)
- ✅ agent-browser (浏览器自动化)
- ✅ proactive-agent (主动代理)

---

## 📊 项目状态汇总

| 项目 | 状态 | 最后更新 | 备注 |
|------|------|---------|------|
| lian2 | ✅ 活跃 | 2026-06-01 | 编剧导演 |
| legal-assistant | ✅ 活跃 | 2026-06-01 | 法律助手 |
| 阿里云配置 | ✅ 完成 | 2026-06-01 | 账单查询 |
| 配置备份 | ✅ 完成 | 2026-06-01 | 安全保存 |
| GitHub 同步 | ✅ 完成 | 2026-06-01 | 文档已同步 |

---

*此文件记录所有项目的关键信息，便于快速查阅*
