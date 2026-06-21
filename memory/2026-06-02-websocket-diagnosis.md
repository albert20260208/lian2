# 2026-06-02 WebSocket 反复断连问题 — 完整排查记录

**时间范围：** 2026-06-02 16:33 ~ 17:02 (GMT+8)
**环境：** 阿里云 ECS（实例 i-uf695rgxp4sa5a32in3s），Alibaba Cloud Linux 4.0.3
**内核：** Linux 6.6.102-5.4.1.alnx4.x86_64
**公网 IP：** 139.224.11.199（EIP）
**内网 IP：** 172.24.32.8
**OpenClaw 版本：** v2026.5.19
**Node.js：** v22.22.0
**访问方式：** 浏览器通过 http://139.224.11.199:13700/f6bd7066/ 访问 Control UI

---

## 一、问题现象

用户反映 UI（Control UI / WebChat）和 OpenClaw Gateway 之间的 WebSocket 连接总是断线，反复重连，体验极差。

---

## 二、排查过程

### 2.1 系统基础检查

**执行命令：**
```bash
ps aux | grep openclaw | grep -v grep
ss -tlnp | grep 13700
netstat -an | grep 13700
uptime
free -h
```

**结果：**
- Gateway 进程正常运行（PID 4700），监听 `0.0.0.0:13700`
- 大量 `TIME_WAIT` 状态的 TCP 连接（127.0.0.1:13700 ↔ 127.0.0.1:各种端口），说明连接频繁建立/断开
- 系统资源充裕：14G 内存仅用 1.3G，负载 0.62
- 无 OOM、无 crash 迹象

### 2.2 openclaw status 检查

**执行命令：**
```bash
openclaw status
```

**结果摘要：**
```
Gateway: local · ws://127.0.0.1:13700 (local loopback) · reachable 169ms · auth token
Gateway service: systemd user installed · enabled · running (pid 4700, state active)
Update available: npm 2026.5.28 (当前 2026.5.19)
Sessions: 1 active · default qwen3.7-max (1000k ctx)
Channels: No channels configured
Heartbeat: 30m (main)
```

### 2.3 配置文件检查

**执行命令：**
```bash
gateway config.get (通过 gateway tool)
```

**关键配置：**
```json
{
  "gateway": {
    "mode": "local",
    "port": 13700,
    "bind": "lan",
    "auth": { "mode": "token" },
    "controlUi": {
      "allowedOrigins": ["http://139.224.11.199:13700"],
      "dangerouslyAllowHostHeaderOriginFallback": true,
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true,
      "basePath": "f6bd7066"
    },
    "reload": { "mode": "restart" },
    "tailscale": { "mode": "off" }
  }
}
```

**config-audit.jsonl 发现异常：**
```json
{
  "suspicious": ["size-drop-vs-last-good:7757->3847"],
  "lastKnownGoodBytes": 7757,
  "bytes": 3847
}
```
配置文件曾被异常缩小（从 7757 字节变为 3847 字节）。

### 2.4 Gateway 日志深度分析（核心发现）

**执行命令：**
```bash
journalctl --user -u openclaw-gateway.service --since "3 hours ago" --no-pager | grep -iE "(restart|start|stop|exit|crash|kill|fatal|error|SIGTERM|SIGKILL|OOM|disconnect|close)"
```

**发现三个关键问题：**

#### 问题 A：paired.json 文件损坏

日志 16:25:47 开始出现：
```
[ws] ✗ parse-error error=JsonFileReadError: Failed to parse JSON file: /home/admin/.openclaw/devices/paired.json <- SyntaxError: Unexpected end of JSON input conn=221bdfca…9888
[ws] closed before connect conn=221bdfca-47c9-414a-b074-705613109888 ... code=1000 reason=n/a
```

**影响：** 每个 WebSocket 连接在握手阶段都因为读取 `paired.json` 失败而被拒绝，导致 UI 反复重连。这个错误在 16:25:47 ~ 16:25:49 之间连续出现多次。

**paired.json 文件检查：**
```bash
ls -la ~/.openclaw/devices/
# paired.json  68762 字节
# paired.json_bak  0 字节（备份文件为空）
# pending.json  2 字节
```

**文件内容分析：**
```bash
python3 统计脚本
```
- 文件内含 **146 个设备**配对记录
- 所有设备都是在 **16:33:50 ~ 16:36:31**（不到 3 分钟）内创建的
- 平均每秒新增约 1 个设备
- 全部标记为 `clientMode: "cli"`，`platform: "linux"`
- 每个设备都有独立的 `deviceId`、`publicKey`、`token`

**原因分析：** 每次 WebSocket 断连后 UI 重连，触发新的 device pairing auto-approved，不断创建新设备记录，形成恶性循环：断连 → 重连 → 新配对 → 文件膨胀 → 解析变慢 → 握手延迟 → 更容易断连。

#### 问题 B：WebSocket 断连 code=1006（异常关闭）

从 16:26:06 开始大量出现：
```
16:26:06 [ws] webchat disconnected code=1006 reason=n/a conn=ee4bec5d...
16:26:06 [ws] webchat disconnected code=1006 reason=n/a conn=2f9667fc...
16:29:36 [ws] webchat disconnected code=1006 reason=n/a conn=3c15aba1...
16:29:36 [ws] webchat disconnected code=1006 reason=n/a conn=9eb2f6af...
16:31:25 [ws] webchat disconnected code=1006 reason=n/a conn=43fadca5...
16:31:25 [ws] webchat disconnected code=1006 reason=n/a conn=9bdd4a87...
16:32:19 [ws] webchat disconnected code=1006 reason=n/a conn=7289ee17...
16:32:19 [ws] webchat disconnected code=1006 reason=n/a conn=76e236b5...
16:33:19 [ws] webchat disconnected code=1006 reason=n/a conn=8df30397...
16:33:19 [ws] webchat disconnected code=1006 reason=n/a conn=b1037c9a...
```

**code=1006 含义：** WebSocket 异常关闭，没有收到正常的 close frame。说明连接被中间层（代理、防火墙、NAT 网关）静默切断。

**断连间隔分析：**
- 16:26:06 → 16:29:36 = 210 秒（约 3.5 分钟）
- 16:29:36 → 16:31:25 = 109 秒
- 16:31:25 → 16:32:19 = 54 秒
- 16:32:19 → 16:33:19 = 60 秒

间隔约 54-60 秒，与阿里云 NAT 网关的 idle timeout 一致。

#### 问题 C：Gateway 反复重启

```
16:29:57 [reload] config change requires gateway restart (agents.defaults.model.primary, models.providers.qwenProvider)
16:29:57 [gateway] received SIGUSR1; restarting
16:29:58 [gateway] restart mode: full process restart (supervisor restart)
16:33:20 [gateway] signal SIGTERM received → restart
16:40:08 [gateway] signal SIGTERM received → shutdown
16:41:39 [gateway] signal SIGTERM received → shutdown
```

**20 分钟内 Gateway 重启了 6 次**，PID 变化序列：
```
1243 → 4595 → 4700 → 1121 → 2458 → 1109
```

每次重启产生 code=1012 (service restart) 断连，进一步加剧问题。

### 2.5 中间层排查

#### 2.5.1 反向代理 / 负载均衡检查

**执行命令：**
```bash
ps aux | grep -E "(nginx|caddy|apache)" | grep -v grep
systemctl list-units --type=service | grep -E "(nginx|caddy|apache)"
cat /etc/nginx/nginx.conf
cat /etc/nginx/sites-enabled/*
cat /etc/nginx/conf.d/*
ps aux | grep socat | grep -v grep
ps aux | grep haproxy | grep -v grep
docker ps
```

**结果：**
- 无 nginx、caddy、apache
- 无 socat、haproxy
- Docker 仅运行 searxng 容器（无端口映射）
- **Gateway 直接监听 `0.0.0.0:13700`，无任何反向代理**

#### 2.5.2 防火墙 / iptables 检查

**执行命令：**
```bash
sudo iptables -L -n
sudo iptables -t nat -L -n
sudo nft list ruleset
```

**结果：**
- INPUT 链 policy = ACCEPT（不拦截入站流量）
- FORWARD 链仅有 Docker 相关规则
- OUTPUT 链 policy = ACCEPT
- nftables 仅有 Docker NAT 规则
- **本机防火墙不是问题原因**

#### 2.5.3 云平台环境确认

**执行命令：**
```bash
curl -s http://100.100.100.200/latest/meta-data/instance-id
curl -s http://100.100.100.200/latest/meta-data/instance/instance-type
curl -s http://100.100.100.200/latest/meta-data/eipv4
curl -s http://100.100.100.200/latest/meta-data/network-type
```

**结果：**
```
实例 ID: i-uf695rgxp4sa5a32in3s
实例类型: ecs.e-c1m4.xlarge
公网 IP: 139.224.11.199 (EIP)
网络类型: vpc
VPC: vsw-uf6wvdhg1ktqms61iol3q
```

**确认：** 阿里云 ECS，VPC 网络，EIP 直连（非 SLB），流量经过阿里云 NAT 网关。

#### 2.5.4 内核 TCP 参数检查

**执行命令：**
```bash
sysctl net.ipv4.tcp_keepalive_time
sysctl net.ipv4.tcp_keepalive_intvl
sysctl net.ipv4.tcp_keepalive_probes
sysctl net.ipv4.tcp_fin_timeout
sysctl net.netfilter.nf_conntrack_tcp_timeout_established
```

**修复前结果：**
```
net.ipv4.tcp_keepalive_time = 7200       (2小时！)
net.ipv4.tcp_keepalive_intvl = 75
net.ipv4.tcp_keepalive_probes = 9
net.ipv4.tcp_fin_timeout = 60
net.netfilter.nf_conntrack_tcp_timeout_established = 432000
```

**问题：** TCP keepalive 默认 7200 秒（2 小时），远大于阿里云 NAT 网关的 idle timeout（约 60 秒）。当 WebSocket 空闲时，NAT 网关在 60 秒内就会丢弃连接，而内核 2 小时后才开始发 keepalive 探测包——此时连接早已被切断。

### 2.6 第一次修复尝试：调整 sysctl

**执行命令：**
```bash
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=15
sudo sysctl -w net.ipv4.tcp_keepalive_probes=5

sudo tee /etc/sysctl.d/99-websocket-keepalive.conf > /dev/null << 'EOF'
# Prevent Alibaba Cloud NAT/SLB idle timeout from killing WebSocket connections
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5
EOF
sudo sysctl --system
```

**验证：**
```
net.ipv4.tcp_keepalive_time = 60    ✓
net.ipv4.tcp_keepalive_intvl = 15   ✓
net.ipv4.tcp_keepalive_probes = 5   ✓
```

**持久化文件已写入 `/etc/sysctl.d/99-websocket-keepalive.conf`。**

### 2.7 修复后验证 — 断连仍在继续

**执行命令：**
```bash
journalctl --user -u openclaw-gateway.service --since "10 minutes ago" --no-pager | grep -iE "(disconnect|close|1006|error|restart)"
```

**结果：** 即使 sysctl 已调整，1006 断连仍然持续出现：
```
16:37:08 [ws] webchat disconnected code=1001 reason=n/a
16:37:42 [ws] webchat disconnected code=1006 reason=n/a
16:38:37 [ws] webchat disconnected code=1006 reason=n/a
16:39:27 [ws] webchat disconnected code=1006 reason=n/a
16:43:10 [ws] webchat disconnected code=1006 reason=n/a
16:46:19 [ws] webchat disconnected code=1006 reason=n/a
16:47:13 [ws] webchat disconnected code=1006 reason=n/a  ← 连接仅存活 23 秒
16:48:07 [ws] webchat disconnected code=1006 reason=n/a
16:48:31 [ws] webchat disconnected code=1006 reason=n/a
16:49:01 [ws] webchat disconnected code=1006 reason=n/a
16:49:25 [ws] webchat disconnected code=1006 reason=n/a
16:49:55 [ws] webchat disconnected code=1006 reason=n/a
16:50:25 [ws] webchat disconnected code=1006 reason=n/a
```

### 2.8 深入排查：为什么 sysctl 不起作用（最终根因）

**执行命令：**
```bash
# 检查 ws 库是否启用了 SO_KEEPALIVE
grep -rn "setKeepAlive" /usr/local/lib/node_modules/openclaw/node_modules/ws/lib/
# 结果：0 个匹配

# 检查 OpenClaw ws runtime
grep -n "setKeepAlive" /usr/local/lib/node_modules/openclaw/dist/server-ws-runtime-Bpr2HYNE.js
# 结果：0 个匹配

# 检查 Node.js 默认 socket keepalive 状态
node -e "const net=require('net'); const s=net.createServer(); s.on('connection',c=>{console.log('SO_KEEPALIVE default:',c.keepAlive);s.close();c.destroy()}); s.listen(0,()=>{net.connect(s.address().port,'127.0.0.1',()=>{setTimeout(()=>process.exit(0),100)})})"
# 结果：SO_KEEPALIVE default: undefined
```

**进一步确认：**
```bash
# ws 库 v8.x 源码中搜索 setKeepAlive
grep -rn "setKeepAlive" /usr/local/lib/node_modules/openclaw/node_modules/ws/
# 结果：0 个匹配

# ws 库版本
cat /usr/local/lib/node_modules/openclaw/node_modules/ws/package.json | grep version
# 结果："version": "8.20.1"

# OpenClaw 所有 dist 文件中搜索 setKeepAlive
grep -rn "setKeepAlive" /usr/local/lib/node_modules/openclaw/dist/*.js
# 结果：
# dist-cjs-BRw03aeK.js:87: request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);  ← HTTP 客户端
# dist-cjs-BRw03aeK.js:89: socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);          ← HTTP 客户端
# dist-cjs-CkQ0cN7M.js:3372: socket.setKeepAlive(true, 1e3 * 60);                        ← HTTP 客户端
# 全部在 HTTP 客户端部分，WebSocket server 没有任何 setKeepAlive 调用
```

**检查 OpenClaw WebSocket ping 实现：**
```javascript
// server-ws-runtime-Bpr2HYNE.js 第 299 行
pingTimer = setInterval(() => {
    try {
        socket.ping();
    } catch {}
}, 25e3);  // 25 秒
```

OpenClaw 有应用层 WebSocket ping（每 25 秒），但这不能替代 TCP 层的 keepalive。当 NAT 网关在应用层 ping 的间隙（或 ping 包本身被丢弃时）切断连接，TCP 层没有 keepalive 兜底。

### 2.9 最终结论

---

## 三、最终诊断结论

### 根因：Node.js `ws` 库（v8.20.1）未启用 `SO_KEEPALIVE`

**完整因果链：**

```
1. OpenClaw Gateway 使用 ws 库 v8.20.1 创建 WebSocket server
2. ws 库在 HTTP upgrade 后，不会调用 socket.setKeepAlive(true)
3. Node.js 的 net.createServer() 默认 keepAlive = undefined（关闭状态）
4. 即使 sysctl 设置了 tcp_keepalive_time=60，socket 没有显式启用 SO_KEEPALIVE，内核不会发送 TCP keepalive 探测包
5. 阿里云 NAT 网关对空闲 TCP 连接有 ~60 秒的 idle timeout
6. WebSocket 连接在空闲 ~54-60 秒后被 NAT 网关静默丢弃
7. 连接被中间层切断，没有 close frame → code=1006
8. UI 检测到断连 → 自动重连 → 触发新的 device pairing
9. paired.json 文件膨胀（3 分钟内 146 个设备）→ 解析变慢 → 握手延迟 → 加剧断连
10. 形成恶性循环
```

### 叠加因素

1. **Gateway 频繁重启**（20 分钟内 6 次）：每次重启触发 code=1012 断连
2. **paired.json 曾损坏**（16:25:47 `SyntaxError: Unexpected end of JSON input`）：导致所有连接被拒绝
3. **配置变更触发重启**（16:29:57 `config change requires gateway restart`）

### 排除项

| 检查项 | 结果 |
|--------|------|
| 本机防火墙 (iptables/nftables) | INPUT=ACCEPT，不拦截，排除 |
| 反向代理 (nginx/haproxy/caddy) | 不存在，Gateway 直连，排除 |
| Docker 端口映射 | 无，排除 |
| OOM / crash | dmesg 无相关记录，排除 |
| 内存不足 | 14G 仅用 1.3G，排除 |
| 磁盘满 | 未出现，排除 |
| CPU 过载 | 负载 0.62，排除 |
| SLB | 无 SLB，EIP 直连 |

---

## 四、已执行的修复

### 4.1 TCP keepalive 调整（已持久化）

**文件：** `/etc/sysctl.d/99-websocket-keepalive.conf`
```
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5
```

**状态：** ✅ 已生效并持久化。但因为是 Node.js ws 库未启用 SO_KEEPALIVE，**此修改单独不能解决问题**，需要配合下面的方案。

### 4.2 paired.json 清理

**执行：** 尝试清理浏览器临时配对，但发现 146 个设备全部标记为 `clientMode: "cli"`（包括浏览器创建的），实际未删除任何记录。

---

## 五、待执行的修复方案

### 方案 A：添加 nginx 反向代理（推荐临时方案）

```nginx
upstream openclaw_ws {
    server 127.0.0.1:13700;
    keepalive 32;
    keepalive_timeout 300s;
}

server {
    listen 80;
    server_name 139.224.11.199;

    location / {
        proxy_pass http://openclaw_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

nginx 会在 HTTP 层管理 keepalive，主动关闭空闲连接并重新建立，避免 NAT 网关静默切断。

### 方案 B：向 OpenClaw 提 issue / 等官方修复

需要 OpenClaw 在 WebSocket server 的 connection handler 中添加：
```javascript
wss.on('connection', (ws, req) => {
    // 在底层 socket 上启用 TCP keepalive
    if (ws._socket) {
        ws._socket.setKeepAlive(true, 30000);
    }
});
```

### 方案 C：阿里云控制台调整

1. 检查安全组规则中 TCP 13700 端口的连接跟踪超时设置
2. 如有 NAT 网关，调整 idle timeout 到 300s 以上
3. 如有 SLB，调整连接空闲超时

---

## 六、相关文件路径

| 文件 | 用途 |
|------|------|
| `/etc/sysctl.d/99-websocket-keepalive.conf` | TCP keepalive 持久化配置 |
| `~/.openclaw/devices/paired.json` | 设备配对记录（当前 146 个，68KB） |
| `~/.openclaw/devices/paired.json_bak` | 配对备份（0 字节，空） |
| `~/.openclaw/openclaw.json` | OpenClaw 主配置 |
| `~/.openclaw/logs/config-audit.jsonl` | 配置审计日志 |
| `~/.openclaw/logs/config-health.json` | 配置健康状态 |
| `/usr/local/lib/node_modules/openclaw/dist/server-ws-runtime-Bpr2HYNE.js` | WebSocket server 运行时 |
| `/usr/local/lib/node_modules/openclaw/node_modules/ws/lib/websocket-server.js` | ws 库 server 实现 |

---

## 七、关键时间线

| 时间 | 事件 |
|------|------|
| 16:25:47 | paired.json 解析失败，所有 WebSocket 连接被拒 |
| 16:26:06 | 首次出现 code=1006 断连 |
| 16:29:36 | code=1006 断连继续 |
| 16:29:57 | config change 触发 Gateway 重启 (SIGUSR1) |
| 16:30:03 | Gateway 重启完成 (PID 4595) |
| 16:31:25 | code=1006 断连（重启后 82 秒） |
| 16:32:19 | code=1006 断连（54 秒间隔） |
| 16:33:19 | code=1006 断连（60 秒间隔） |
| 16:33:20 | Gateway 收到 SIGTERM，重启 (PID 4700) |
| 16:33:35~36:31 | paired.json 在 3 分钟内累积 146 个设备 |
| 16:34:07 | 新 Gateway 启动后 40 秒即出现 code=1006 |
| 16:35:01 | code=1006 断连 |
| 16:35:54 | code=1006 断连 |
| 16:36:49 | code=1006 断连 |
| 16:37:00 | sysctl keepalive 调整完成并持久化 |
| 16:37:42 | **sysctl 调整后** code=1006 仍在继续 |
| 16:38:37 ~ 16:50:25 | 持续 code=1006 断连，间隔 23~60 秒不等 |
| 16:40:08 | Gateway SIGTERM 关闭 |
| 16:41:39 | Gateway 再次重启 (PID 2458) |
| 16:44:15 | Gateway 再次重启 (PID 1109) |
| 17:02 | 形成此诊断文档 |

---

*文档生成时间：2026-06-02 17:02 GMT+8*
