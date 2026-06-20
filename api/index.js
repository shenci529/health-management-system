// Vercel Serverless Functions - API 入口
// 这个文件把所有 /api/* 请求转发到我们的 Express 应用逻辑
// 注意：Vercel 上运行时数据库为内存模式（每次冷启动会重置）
// 如需持久化数据库，请使用 Render / Railway / 本地部署

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const licenseService = require('../server/licenseService');
const smsService = require('../server/smsService');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 内存数据库（Vercel 无文件系统持久化）
let dbInstance = null;
let SQL = null;

async function initDatabase() {
  if (dbInstance) return;
  SQL = await initSqlJs();
  dbInstance = new SQL.Database();
  
  // 执行 schema.sql 创建表结构
  const schemaPath = path.join(__dirname, '../server/database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    dbInstance.exec(schemaSql);
  }
  
  // 插入测试账号
  try {
    dbInstance.run("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['admin', 'admin123', '系统管理员', 'admin']);
  } catch (e) { /* 忽略已存在 */ }
  
  // 插入测试授权码
  try {
    const demoCodes = [
      { code: 'ABCDEFGHIJKLMNOP', customer: '示例幼儿园', phone: '13800138000' },
      { code: 'QRSTUVWXYZABCDEF', customer: '示例小学', phone: '13900139000' }
    ];
    for (const item of demoCodes) {
      dbInstance.run(
        "INSERT INTO licenses (license_code, customer_name, customer_phone, school_name, status, max_users) VALUES (?, ?, ?, ?, ?, ?)",
        [item.code, item.customer, item.phone, item.customer, 'active', 100]
      );
    }
  } catch (e) { /* 忽略已存在 */ }
}

function queryAll(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function queryRun(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  dbInstance.run(sql, params);
  const lastID = dbInstance.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  return { lastID, changes: 1 };
}

// ==================== 路由（与 server/server.js 保持一致）====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel' });
});

// 授权码管理
app.get('/api/license', (req, res) => {
  try {
    initDatabase().then(() => {
      const licenses = queryAll('SELECT * FROM licenses ORDER BY created_at DESC');
      licenses.forEach(l => {
        if (l.license_code) l.formatted_code = licenseService.formatLicenseCode(l.license_code);
      });
      res.json({ success: true, data: licenses });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/license/stats', (req, res) => {
  initDatabase().then(() => {
    const active = queryOne("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'");
    const used = queryOne("SELECT COUNT(*) as count FROM licenses WHERE status = 'used'");
    const expired = queryOne("SELECT COUNT(*) as count FROM licenses WHERE status = 'expired'");
    const revoked = queryOne("SELECT COUNT(*) as count FROM licenses WHERE status = 'revoked'");
    res.json({
      success: true,
      data: {
        total: (active?.count || 0) + (used?.count || 0) + (expired?.count || 0) + (revoked?.count || 0),
        active: active?.count || 0,
        used: used?.count || 0,
        expired: expired?.count || 0,
        revoked: revoked?.count || 0
      }
    });
  });
});

app.post('/api/license/generate', async (req, res) => {
  try {
    await initDatabase();
    const { customer_name = '', customer_phone = '', school_name = '', valid_days = 365, max_users = 100, notes = '' } = req.body;
    const licenseCode = licenseService.generateLicenseCode();
    const validStart = new Date().toISOString().split('T')[0];
    const validEnd = new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = queryRun(
      'INSERT INTO licenses (license_code, customer_name, customer_phone, school_name, valid_start, valid_end, max_users, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [licenseCode, customer_name, customer_phone, school_name, validStart, validEnd, max_users, notes, 'active']
    );
    res.json({ success: true, id: result.lastID, license_code: licenseService.formatLicenseCode(licenseCode) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/license/:id/activate', async (req, res) => {
  try {
    await initDatabase();
    queryRun("UPDATE licenses SET status = ?, activated_at = ?, activated_by = ? WHERE id = ?",
      ['used', new Date().toISOString(), req.body.activated_by || 'admin', req.params.id]);
    res.json({ success: true, message: '授权激活成功' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/license/:id/revoke', async (req, res) => {
  try {
    await initDatabase();
    queryRun("UPDATE licenses SET status = ? WHERE id = ?", ['revoked', req.params.id]);
    res.json({ success: true, message: '授权已撤销' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/license/:id', async (req, res) => {
  try {
    await initDatabase();
    queryRun('DELETE FROM licenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '授权已删除' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 用户登录
app.post('/api/users/login', async (req, res) => {
  try {
    await initDatabase();
    const { username, password } = req.body;
    const user = queryOne('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } else {
      res.json({ success: false, message: '账号或密码错误' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 默认 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在: ' + req.url });
});

// 导出给 Vercel
module.exports = app;

// 如果直接运行（开发模式）也启动本地服务器
if (require.main === module) {
  const PORT = process.env.PORT || 3002;
  initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Vercel API 服务运行在 http://localhost:${PORT}`);
    });
  });
}
