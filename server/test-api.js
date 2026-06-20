const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const initSqlJs = require('sql.js');
const licenseService = require('./licenseService');

const PORT = 3002;

let dbInstance = null;
let SQL = null;

const dbDir = path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'health_management.db');

async function initDatabase() {
  SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
    console.log('✅ 数据库连接成功（从文件加载）');
  } else {
    dbInstance = new SQL.Database();
    console.log('✅ 数据库连接成功（新数据库）');
    const schemaPath = path.join(dbDir, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      dbInstance.exec(schemaSql);
      console.log('✅ 数据库表结构创建成功');
    }
    const data = dbInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
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

function queryRun(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  dbInstance.run(sql, params);
  const data = dbInstance.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  const lastID = dbInstance.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  return { lastID, changes: 1 };
}

(async () => {
  await initDatabase();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/license', (req, res) => {
    try {
      const { status } = req.query;
      let sql = 'SELECT * FROM licenses ORDER BY created_at DESC';
      const params = [];
      if (status) {
        sql = 'SELECT * FROM licenses WHERE status = ? ORDER BY created_at DESC';
        params.push(status);
      }
      const licenses = queryAll(sql, params);
      licenses.forEach(license => {
        if (license.license_code) {
          license.formatted_code = licenseService.formatLicenseCode(license.license_code);
        }
      });
      console.log('GET /api/license -> 返回', licenses.length, '条记录');
      res.json({ success: true, data: licenses });
    } catch (err) {
      console.error('❌ GET /api/license 错误:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/license/generate', async (req, res) => {
    try {
      const { customer_name = '', customer_phone = '', customer_email = '', school_name = '', valid_days = 365, max_users = 100, notes = '' } = req.body;
      console.log('POST /api/license/generate -> body:', req.body);
      const licenseCode = licenseService.generateLicenseCode();
      const formattedCode = licenseService.formatLicenseCode(licenseCode);
      const qrData = 'LICENSE:' + licenseCode;
      const qrCode = await licenseService.generateQRCode(qrData);
      const validStart = new Date().toISOString().split('T')[0];
      const validEnd = valid_days ? new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
      const result = queryRun(
        'INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [licenseCode, qrCode, customer_name, customer_phone, customer_email, school_name, validStart, validEnd || '', max_users, req.body.created_by || 1, new Date().toISOString(), notes]
      );
      res.json({ success: true, id: result.lastID, license_code: formattedCode, qr_code: qrCode, valid_start: validStart, valid_end: validEnd });
      console.log('✅ 生成授权码成功:', formattedCode);
    } catch (err) {
      console.error('❌ POST /api/license/generate 错误:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/license/stats', (req, res) => {
    try {
      const result = dbInstance.exec('SELECT status, COUNT(*) as count FROM licenses GROUP BY status');
      const stats = { total: 0, active: 0, used: 0, expired: 0, revoked: 0 };
      if (result[0]) {
        for (const row of result[0].values) {
          stats[row[0]] = row[1];
          stats.total += row[1];
        }
      }
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ 后端服务已启动: http://localhost:' + PORT);
    console.log('\n=== 开始测试 API ===');
    
    setTimeout(() => {
      // 测试 GET /api/license
      http.get('http://localhost:' + PORT + '/api/license', (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          console.log('GET /api/license -> 状态码:', res.statusCode, '| 响应:', body.substring(0, 200) + '...');
          
          // 测试 POST /api/license/generate
          const postData = JSON.stringify({ customer_name: '测试学校', school_name: '测试小学', valid_days: 365, max_users: 100 });
          const req = http.request({ hostname: 'localhost', port: PORT, path: '/api/license/generate', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } }, (res2) => {
            let body2 = '';
            res2.on('data', (chunk) => body2 += chunk);
            res2.on('end', () => {
              console.log('POST /api/license/generate -> 状态码:', res2.statusCode, '| 响应:', body2.substring(0, 200) + '...');
              console.log('\n=== 测试完成，服务器继续运行 ===');
              console.log('可以在浏览器打开 http://localhost:3000 测试前端');
            });
          });
          req.on('error', (e) => console.error('POST 请求错误:', e.message));
          req.write(postData);
          req.end();
        });
      }).on('error', (e) => console.error('GET 请求错误:', e.message));
    }, 1000);
  });
})();
