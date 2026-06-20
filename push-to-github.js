const https = require('https');
const fs = require('fs');
const path = require('path');

const OWNER = 'shenci529';
const REPO = 'health-management-system';
const BRANCH = 'main';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('错误：请提供 GitHub Personal Access Token');
  console.error('用法: node push-to-github.js <your-token>');
  console.error('或设置环境变量: set GITHUB_TOKEN=<your-token>');
  process.exit(1);
}

console.log('=' .repeat(60));
console.log('🚀 GitHub API 代码推送工具');
console.log('=' .repeat(60));
console.log(`仓库: ${OWNER}/${REPO}`);
console.log(`分支: ${BRANCH}`);
console.log('');

function apiRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'api.github.com',
      port: 443,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Health-System-Push',
        'Accept': 'application/vnd.github.v3+json'
      },
      ...options
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject({ status: res.statusCode, data: parsed, message: data });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function getLatestCommit() {
  console.log('📡 获取最新 commit SHA...');
  const result = await apiRequest({
    method: 'GET',
    path: `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`
  });
  console.log(`   ✅ Commit SHA: ${result.data.object.sha.substring(0, 8)}...`);
  return result.data.object.sha;
}

async function getTreeSha(commitSha) {
  console.log('📡 获取 tree SHA...');
  const result = await apiRequest({
    method: 'GET',
    path: `/repos/${OWNER}/${REPO}/git/commits/${commitSha}`
  });
  console.log(`   ✅ Tree SHA: ${result.data.tree.sha.substring(0, 8)}...`);
  return result.data.tree.sha;
}

async function createBlob(content, encoding = 'base64') {
  const body = {
    content: encoding === 'base64' ? content : content,
    encoding: encoding
  };
  const result = await apiRequest({
    method: 'POST',
    path: `/repos/${OWNER}/${REPO}/git/blobs`
  }, body);
  return result.data.sha;
}

async function createTree(baseTreeSha, treeItems) {
  console.log('📡 创建新 tree...');
  const body = {
    base_tree: baseTreeSha,
    tree: treeItems
  };
  const result = await apiRequest({
    method: 'POST',
    path: `/repos/${OWNER}/${REPO}/git/trees`
  }, body);
  console.log(`   ✅ 新 Tree SHA: ${result.data.sha.substring(0, 8)}...`);
  return result.data.sha;
}

async function createCommit(parentSha, treeSha, message) {
  console.log('📡 创建新 commit...');
  const body = {
    message: message,
    parents: [parentSha],
    tree: treeSha,
    author: {
      name: 'HealthSystem',
      email: 'health@example.com',
      date: new Date().toISOString()
    }
  };
  const result = await apiRequest({
    method: 'POST',
    path: `/repos/${OWNER}/${REPO}/git/commits`
  }, body);
  console.log(`   ✅ 新 Commit SHA: ${result.data.sha.substring(0, 8)}...`);
  return result.data.sha;
}

async function updateRef(commitSha) {
  console.log('📡 更新分支引用...');
  const body = {
    sha: commitSha,
    force: false
  };
  const result = await apiRequest({
    method: 'PATCH',
    path: `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`
  }, body);
  console.log(`   ✅ 分支已更新到: ${result.data.object.sha.substring(0, 8)}...`);
  return result.data;
}

function fileToBase64(filePath) {
  const content = fs.readFileSync(filePath);
  return Buffer.from(content).toString('base64');
}

async function main() {
  try {
    const filesToPush = [
      { path: '.gitignore', filePath: path.join(__dirname, '.gitignore') },
      { path: 'server/licenseService.js', filePath: path.join(__dirname, 'server', 'licenseService.js') },
      { path: 'src/licenseService.js', filePath: path.join(__dirname, 'src', 'licenseService.js') },
      { path: 'src/views/LicenseActivate.vue', filePath: path.join(__dirname, 'src', 'views', 'LicenseActivate.vue') }
    ];

    console.log('📦 准备推送的文件:');
    for (const f of filesToPush) {
      const exists = fs.existsSync(f.filePath);
      const size = exists ? fs.statSync(f.filePath).size : 0;
      console.log(`   ${exists ? '✅' : '❌'} ${f.path} (${size} bytes)`);
      if (!exists) {
        throw new Error(`文件不存在: ${f.filePath}`);
      }
    }
    console.log('');

    const latestCommitSha = await getLatestCommit();
    const baseTreeSha = await getTreeSha(latestCommitSha);
    console.log('');

    console.log('📦 创建 blobs...');
    const treeItems = [];
    for (const f of filesToPush) {
      const base64 = fileToBase64(f.filePath);
      const blobSha = await createBlob(base64);
      console.log(`   ✅ ${f.path} -> ${blobSha.substring(0, 8)}...`);
      treeItems.push({
        path: f.path,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      });
    }
    console.log('');

    const newTreeSha = await createTree(baseTreeSha, treeItems);
    console.log('');

    const message = '实现授权验证：客户端本地校验授权码，无需网络即可激活';
    const newCommitSha = await createCommit(latestCommitSha, newTreeSha, message);
    console.log('');

    await updateRef(newCommitSha);
    console.log('');

    console.log('=' .repeat(60));
    console.log('🎉 推送成功！');
    console.log('=' .repeat(60));
    console.log(`新 commit: ${newCommitSha}`);
    console.log(`查看仓库: https://github.com/${OWNER}/${REPO}`);
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ 推送失败:');
    if (error.status) {
      console.error(`   HTTP 状态码: ${error.status}`);
      console.error(`   响应: ${typeof error.data === 'object' ? JSON.stringify(error.data) : error.data}`);
    } else if (error.message) {
      console.error(`   错误: ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    console.error('');
    console.error('💡 提示: 请确认 Token 有 "repo" 权限');
    console.error('💡 创建 Token: https://github.com/settings/tokens');
    process.exit(1);
  }
}

main();
