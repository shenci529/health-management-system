// sync-api-base.js
// 从 current-tunnels.json 读取最新公网 URL，并同步写入：
//   - src/main.js (Vue前端)
//   - miniprogram/app.js (小程序)
// 然后重新 npm run build 以刷新 dist。
// 用法：node sync-api-base.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const TUNNEL_FILE = path.join(ROOT, 'current-tunnels.json');
const FRONT_MAIN = path.join(ROOT, 'src', 'main.js');
const MINI_APP = path.join(ROOT, 'miniprogram', 'app.js');

if (!fs.existsSync(TUNNEL_FILE)) {
  console.error('❌ current-tunnels.json 不存在，请先启动 tunnel-daemon.js');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(TUNNEL_FILE, 'utf8'));
} catch (err) {
  console.error('❌ 无法解析 current-tunnels.json:', err.message);
  process.exit(1);
}

const apiUrl = data['后端API'] && data['后端API'].url;
if (!apiUrl) {
  console.error('❌ current-tunnels.json 中未找到"后端API"条目');
  process.exit(1);
}
console.log(`📡 最新后端API地址: ${apiUrl}`);

function replaceInFile(file, pattern, replacement) {
  const original = fs.readFileSync(file, 'utf8');
  const next = original.replace(pattern, replacement);
  if (next === original) {
    console.log(`  ⚠️  ${path.relative(ROOT, file)} 未找到匹配位置，未更新`);
    return false;
  }
  fs.writeFileSync(file, next, 'utf8');
  console.log(`  ✅ 已更新: ${path.relative(ROOT, file)}`);
  return true;
}

// 1) src/main.js —— 替换形如 const PUBLIC_API_BASE = 'https://xxx.loca.lt'; 的行
replaceInFile(
  FRONT_MAIN,
  /const PUBLIC_API_BASE\s*=\s*['"][^'"]+['"];/,
  `const PUBLIC_API_BASE = '${apiUrl}';`
);

// 2) miniprogram/app.js —— 替换形如 apiBaseUrl: 'https://xxx.loca.lt'
replaceInFile(
  MINI_APP,
  /apiBaseUrl:\s*['"][^'"]+['"]/,
  `apiBaseUrl: '${apiUrl}'`
);

console.log('\n🔨 重新构建前端 dist...');
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n✅ 构建完成。手机端可访问: ' + (data['前端页面'] && data['前端页面'].url));
} catch (err) {
  console.error('\n❌ 构建失败:', err.message);
  process.exit(1);
}
