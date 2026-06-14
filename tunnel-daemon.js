// tunnel-daemon.js —— 持续维护两个 localtunnel 隧道连接：
//   - 前端 HTTP 静态资源端口 3003
//   - 后端 API 端口 3002
// 使用方式：node tunnel-daemon.js
// 程序会无限循环地创建/重建隧道，并把当前可用 URL 输出到控制台和 current-tunnels.json。

const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

const TUNNELS = [
  { name: '前端页面', port: 3003 },
  { name: '后端API',  port: 3002 }
];

const TUNNEL_FILE = path.join(__dirname, 'current-tunnels.json');
const state = {};

function writeState() {
  const snapshot = {};
  for (const k of Object.keys(state)) {
    snapshot[k] = { url: state[k].url, port: state[k].port };
  }
  try {
    fs.writeFileSync(TUNNEL_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
  } catch (_) {}
}

async function startOne(tunnelCfg) {
  try {
    const tunnel = await localtunnel({ port: tunnelCfg.port });
    state[tunnelCfg.name] = { url: tunnel.url, tunnel, port: tunnelCfg.port };
    console.log(`[${new Date().toLocaleString()}] ✅ ${tunnelCfg.name} 已上线: ${tunnel.url}`);
    writeState();

    tunnel.on('close', () => {
      console.log(`[${new Date().toLocaleString()}] ⚠️ ${tunnelCfg.name} 隧道已关闭，2秒后重建...`);
      setTimeout(() => startOne(tunnelCfg), 2000);
    });

    tunnel.on('error', (err) => {
      console.log(`[${new Date().toLocaleString()}] ❌ ${tunnelCfg.name} 报错: ${err.message}，2秒后重建...`);
      try { tunnel.close(); } catch (_) {}
      setTimeout(() => startOne(tunnelCfg), 2000);
    });
  } catch (err) {
    console.log(`[${new Date().toLocaleString()}] ❌ ${tunnelCfg.name} 创建失败: ${err.message}，3秒后重试...`);
    setTimeout(() => startOne(tunnelCfg), 3000);
  }
}

// 心跳：每 15 秒检查一次隧道状态，掉线则重建
setInterval(() => {
  for (const cfg of TUNNELS) {
    const s = state[cfg.name];
    if (!s || !s.tunnel || !s.url) {
      console.log(`[心跳] ${cfg.name} 无有效隧道，尝试重建...`);
      startOne(cfg);
    }
  }
}, 15000);

console.log('========================================');
console.log('  幼儿中小学生健康管理系统 - 公网隧道守护');
console.log('========================================');
console.log(`URL 会自动写入: ${TUNNEL_FILE}`);
TUNNELS.forEach(t => startOne(t));

process.on('SIGINT', () => {
  console.log('\n正在关闭所有隧道...');
  for (const name of Object.keys(state)) {
    try { state[name].tunnel.close(); } catch (_) {}
  }
  process.exit(0);
});
