#!/usr/bin/env node

/**
 * 复现 OpenClaw paired.json 设备膨胀问题
 * 
 * 问题背景:
 *   Gateway 配置了 dangerouslyDisableDeviceAuth=true，导致每个 WebSocket 连接
 *   （包括从 127.0.0.1 来的 CLI 连接）都被 auto-approved，写入 paired.json。
 *   10天内产生了 137,552 个设备（101MB）。
 * 
 * 复现步骤:
 *   1. 读取当前 paired.json 设备数量
 *   2. 模拟多个 CLI 客户端快速连接+断开（类似 code=1006 异常关闭）
 *   3. 再次读取 paired.json，对比设备数量
 */

const WebSocket = require('/usr/local/lib/node_modules/openclaw/node_modules/ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PAIRED_JSON = path.join(process.env.HOME || '/home/admin', '.openclaw/devices/paired.json');
const GATEWAY_URL = process.env.GATEWAY_URL || 'ws://127.0.0.1:13700';
const NUM_CONNECTIONS = parseInt(process.env.NUM_CONNECTIONS || '20');
const DELAY_MS = parseInt(process.env.DELAY_MS || '500');

function readDeviceCount() {
  try {
    const data = fs.readFileSync(PAIRED_JSON, 'utf8');
    const parsed = JSON.parse(data);
    return {
      count: Object.keys(parsed).length,
      size: fs.statSync(PAIRED_JSON).size
    };
  } catch (e) {
    console.error(`[ERROR] 无法读取 paired.json: ${e.message}`);
    return { count: 0, size: 0 };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模拟一个 CLI 客户端:
 * - 连接时发送 cli 相关的 client info
 * - 在握手完成前立即断开（模拟 code=1006 异常关闭）
 */
function simulateCliClient(index) {
  return new Promise((resolve, reject) => {
    const deviceId = crypto.randomBytes(32).toString('hex');
    const startTime = Date.now();

    console.log(`  [${String(index).padStart(3)}] 连接中... (deviceId=${deviceId.slice(0, 12)}...)`);

    const ws = new WebSocket(GATEWAY_URL, {
      headers: {
        'User-Agent': 'openclaw-cli/2026.5.19',
        'X-OpenClaw-Client-Id': 'cli',
        'X-OpenClaw-Client-Mode': 'cli',
        'X-OpenClaw-Device-Id': deviceId,
        'X-OpenClaw-Platform': 'linux',
      },
      handshakeTimeout: 3000,
    });

    let phase = 'connecting';

    ws.on('open', () => {
      phase = 'open';
      // 模拟：连接后立即发送一些数据（类似 CLI 握手）
      try {
        ws.send(JSON.stringify({
          type: 'hello',
          client: {
            id: 'cli',
            mode: 'cli',
            version: '2026.5.19'
          },
          device: {
            id: deviceId,
            platform: 'linux'
          }
        }));
      } catch (e) {
        // ignore
      }

      // 关键：模拟异常关闭（不调用 close()，直接 destroy socket）
      // 这会触发 code=1006（abnormal closure）
      setTimeout(() => {
        phase = 'destroying';
        try {
          // 直接销毁底层 socket，不发送 WebSocket close frame
          if (ws._socket) {
            ws._socket.destroy();
          } else {
            ws.terminate();
          }
        } catch (e) {
          // ignore
        }
      }, 100);
    });

    ws.on('error', (err) => {
      phase = 'error';
      // 连接错误是预期的（某些连接可能失败）
    });

    ws.on('close', (code, reason) => {
      const elapsed = Date.now() - startTime;
      const reasonStr = reason ? reason.toString() : 'n/a';
      console.log(`  [${String(index).padStart(3)}] 断开 code=${code} reason=${reasonStr} (${elapsed}ms)`);
      resolve({ index, deviceId, code, elapsed });
    });

    // 超时保护
    setTimeout(() => {
      try { ws.terminate(); } catch (e) {}
      const elapsed = Date.now() - startTime;
      console.log(`  [${String(index).padStart(3)}] 超时 (${elapsed}ms)`);
      resolve({ index, deviceId, code: -1, elapsed, timeout: true });
    }, 5000);
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('OpenClaw paired.json 设备膨胀问题 — 复现脚本');
  console.log('='.repeat(70));
  console.log();

  // 检查环境
  console.log(`Gateway URL:    ${GATEWAY_URL}`);
  console.log(`paired.json:    ${PAIRED_JSON}`);
  console.log(`连接数:         ${NUM_CONNECTIONS}`);
  console.log(`连接间隔:       ${DELAY_MS}ms`);
  console.log();

  if (!fs.existsSync(PAIRED_JSON)) {
    console.error('[FATAL] paired.json 不存在，请确认 OpenClaw 已安装并运行过');
    process.exit(1);
  }

  // 阶段1: 记录初始状态
  const before = readDeviceCount();
  console.log(`📊 初始状态:`);
  console.log(`   设备数量: ${before.count}`);
  console.log(`   文件大小: ${(before.size / 1024 / 1024).toFixed(2)} MB`);
  console.log();

  // 阶段2: 模拟 CLI 客户端连接+断开
  console.log(`🔄 模拟 ${NUM_CONNECTIONS} 个 CLI 客户端连接+异常断开:`);
  console.log();

  const results = [];
  for (let i = 0; i < NUM_CONNECTIONS; i++) {
    const result = await simulateCliClient(i);
    results.push(result);
    if (i < NUM_CONNECTIONS - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log();

  // 等待 Gateway 处理完所有配对
  console.log('⏳ 等待 3 秒让 Gateway 处理设备配对...');
  await sleep(3000);

  // 阶段3: 检查最终状态
  const after = readDeviceCount();
  const delta = after.count - before.count;

  console.log();
  console.log(`📊 最终状态:`);
  console.log(`   设备数量: ${after.count}`);
  console.log(`   文件大小: ${(after.size / 1024 / 1024).toFixed(2)} MB`);
  console.log();

  // 统计结果
  const closedBeforeConnect = results.filter(r => r.code === 1006 || r.code === 1001).length;
  const timeouts = results.filter(r => r.timeout).length;
  const normalClose = results.filter(r => r.code === 1000).length;

  console.log(`📈 连接统计:`);
  console.log(`   总连接数:              ${results.length}`);
  console.log(`   异常关闭 (1006/1001):  ${closedBeforeConnect}`);
  console.log(`   正常关闭 (1000):       ${normalClose}`);
  console.log(`   超时:                  ${timeouts}`);
  console.log();

  console.log(`📈 设备变化:`);
  console.log(`   新增设备: ${delta}`);
  if (delta > 0) {
    console.log(`   ⚠️  每个连接产生了 ${(delta / results.length).toFixed(2)} 个新设备`);
  }
  console.log();

  // 结论
  console.log('='.repeat(70));
  if (delta > 0) {
    console.log('✅ 问题复现成功！');
    console.log();
    console.log('根因分析:');
    console.log('  dangerouslyDisableDeviceAuth=true 导致所有连接被 auto-approved');
    console.log('  每个 CLI 连接（即使异常断开）都创建新的设备记录写入 paired.json');
    console.log();
    console.log('修复建议:');
    console.log('  1. 设置 gateway.controlUi.dangerouslyDisableDeviceAuth = false');
    console.log('  2. 设置 gateway.controlUi.allowInsecureAuth = false');
    console.log('  3. 清理 paired.json 中的冗余设备');
    console.log('  4. 升级到 2026.6.5+（可能已修复）');
  } else {
    console.log('❌ 未检测到新设备，问题未复现');
    console.log('  可能原因: dangerouslyDisableDeviceAuth 已修复或连接方式不匹配');
  }
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
