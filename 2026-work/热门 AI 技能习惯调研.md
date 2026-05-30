# 热门 AI Agent 技能与行为习惯调研

**调研时间**: 2026-05-30  
**数据来源**: GitHub, ClawHub, OpenClaw Skills Registry

---

## 🏆 Top 热门技能 (按 Star 数)

| 排名 | 技能名称 | Stars | 核心功能 |
|------|---------|-------|---------|
| 1 | **last30days-skill** | 26,798 ⭐ | 跨 Reddit/X/YouTube 研究任何主题 |
| 2 | **openclaw-backup** | 669 ⭐ | OpenClaw 一键备份与恢复 |
| 3 | **registry-broker-skills** | 348 ⭐ | Universal Registry 搜索/聊天/分析 |
| 4 | **bdpan-storage** | 97 ⭐ | 百度网盘上传/下载/管理 |
| 5 | **APIClaw-Skills** | 44 ⭐ | 亚马逊产品研究 API 集成 |

---

## 📋 常用行为习惯类技能

### 1. ✅ Proactive Agent (主动代理)
**Stars**: 高人气 | **作者**: halthelobster

**核心功能**:
- 🧠 **主动 anticipate** - 不等待指令，主动预测用户需求
- 🔄 **Reverse Prompting** - 提出用户没想到的建议
- 💓 **Proactive Check-ins** - 监控重要事项并主动汇报
- 📝 **WAL Protocol** - 写前日志，记录关键决策
- 🛡️ **Self-Improvement** - 持续自我改进

**适用场景**:
- 日常心跳检查 (邮箱/日历/天气)
- 主动提醒重要事件
- 自动整理工作区文件

---

### 2. 🔄 Self-Improvement (自我改进)
**Stars**: 广泛使用 | **作者**: peterskoett

**核心功能**:
- 📖 **Learnings 记录** - 记录用户纠正、知识更新
- ❌ **Errors 日志** - 记录命令失败、API 错误
- 💡 **Feature Requests** - 记录用户需求的功能
- 📤 **Promotion 机制** - 将学习提升到 AGENTS.md/SOUL.md/TOOLS.md

**触发场景**:
1. 命令/操作意外失败
2. 用户纠正 ("不对...", "实际上...")
3. 用户请求不存在的能力
4. 外部 API/工具失败
5. 发现更好的方法

**文件结构**:
```
.learnings/
├── LEARNINGS.md       # 纠正、知识缺口、最佳实践
├── ERRORS.md          # 命令失败、异常
└── FEATURE_REQUESTS.md # 用户请求的功能
```

---

### 3. 🔍 SearXNG (隐私搜索)
**Stars**: 社区标准 | **作者**: Avinash Venkatswamy

**核心功能**:
- 🔒 **隐私保护** - 使用本地 SearXNG 实例
- 🌐 **多引擎聚合** - 同时搜索多个搜索引擎
- 📰 **多类别搜索** - 网页/图片/视频/新闻
- 🎨 **格式化输出** - 美观的搜索结果展示
- 🚀 **JSON 模式** - 程序化使用

**命令示例**:
```bash
# 搜索前 10 条结果
uv run scripts/searxng.py search "query"

# 搜索前 20 条
uv run scripts/searxng.py search "query" -n 20

# 图片搜索
uv run scripts/searxng.py search "query" --category images
```

---

### 4. 🌐 Agent Browser (浏览器自动化)
**Stars**: 高人气 | **作者**: 社区贡献

**核心功能**:
- 🖱️ **网页交互** - 点击、输入、拖拽
- 📸 **截图录制** - 捕获页面状态
- 🎥 **视频录制** - 记录操作过程
- 🔐 **会话管理** - 认证会话保持
- 📊 **数据抓取** - 提取网页内容

**适用场景**:
- 网页自动化测试
- 数据提取与研究
- 表单自动填写
- 需要登录的网站操作

---

### 5. 🎯 Skill Vetter (技能审查)
**Stars**: 安全必备 | **作者**: 社区贡献

**核心功能**:
- 🔒 **安全检查** - 安装前审查技能代码
- 🚩 **红旗检测** - 识别可疑权限和模式
- 📋 **权限范围** - 检查技能请求的权限
- ✅ **信任评分** - 给技能打分

**使用时机**:
- 从 ClawHub/GitHub 安装任何技能前
- 审查第三方技能代码
- 评估技能安全性

---

## 🎯 常见机器人行为习惯

### ✅ 推荐习惯

| 习惯 | 描述 | 实现技能 |
|------|------|---------|
| **主动检查** | 定期检查邮箱/日历/通知 | Proactive Agent |
| **错误学习** | 记录失败并避免重复 | Self-Improvement |
| **隐私搜索** | 使用本地搜索实例 | SearXNG |
| **文件去重** | 写入前检查重复 | 自定义规则 |
| **心跳响应** | 定期汇报状态 | Proactive Agent |
| **安全审查** | 安装技能前检查 | Skill Vetter |

---

### ⚠️ 避免的行为

| 行为 | 问题 | 解决方案 |
|------|------|---------|
| 重复写入文件 | 工作区混乱 | 写入前检查 + 用户确认 |
| 过度打扰 | 用户体验差 | 心跳时合并检查 |
| 盲目安装技能 | 安全风险 | 使用 Skill Vetter 审查 |
| 不记录错误 | 重复犯错 | 写入 .learnings/ERRORS.md |
| 忽略用户纠正 | 信任损失 | 记录到 .learnings/LEARNINGS.md |

---

## 📊 使用频率统计

### 最高频使用 (每日)
1. **搜索类** - SearXNG, web_search
2. **文件操作** - read, write, edit
3. **记忆管理** - memory_search, memory_get
4. **心跳检查** - Proactive Agent 心跳

### 中频使用 (每周)
1. **技能安装** - clawhub, skill-vetter
2. **浏览器自动化** - agent-browser
3. **备份同步** - openclaw-backup, git push

### 低频使用 (按需)
1. **API 集成** - APIClaw, 特定服务
2. **媒体处理** - 视频/图片/音频生成
3. **数据库操作** - surreal-skills

---

## 💡 建议添加的习惯

基于调研，建议在工作区添加以下习惯：

### 1. 📝 写入前重复检查 (已实现)
```markdown
## 📁 File Writing Rules

**"Same Directory + Two Levels Deep" Limit**
- 写入前检查相同目录及下两层是否已有相似文件
- 发现重复时提醒用户，等待确认后再写入
```

### 2. 🔒 技能安装前审查
```markdown
## Skill Installation Security
- 安装任何外部技能前运行 skill-vetter
- 检查权限范围和可疑代码
- 记录安装的技能列表
```

### 3. 📖 错误学习循环
```markdown
## Error Learning Loop
- 每次错误记录到 .learnings/ERRORS.md
- 定期回顾错误模式
- 将通用教训提升到 TOOLS.md/AGENTS.md
```

### 4. 💓 心跳合并检查
```markdown
## Heartbeat Best Practices
- 合并多项检查到一次心跳 (邮箱 + 日历 + 天气)
- 避免频繁 API 调用
- 夜间 (23:00-08:00) 保持安静
```

---

## 🔗 相关资源

- **ClawHub**: https://clawhub.ai - 技能市场
- **OpenClaw Docs**: https://docs.openclaw.ai
- **GitHub 搜索**: `clawhub skill agent`
- **社区 Discord**: https://discord.com/invite/clawd

---

*调研报告生成时间：2026-05-30 12:35*
