const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const initSqlJs = require('sql.js');
const smsService = require('./smsService');
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
    saveDatabase();
  }
}

function saveDatabase() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
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
  if (!dbInstance) throw new Error('数据库未初始化');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) stmt.bind(params);
  let result = null;
  if (stmt.step()) result = stmt.getAsObject();
  stmt.free();
  return result;
}

function queryRun(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  dbInstance.run(sql, params);
  saveDatabase();
  const lastID = dbInstance.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  return { lastID, changes: 1 };
}

(async () => {
  await initDatabase();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/api/license/generate', async (req, res) => {
    try {
      console.log('POST /api/license/generate 请求体:', JSON.stringify(req.body));
      const { customer_name = '', customer_phone = '', customer_email = '', school_name = '', valid_days = 365, max_users = 100, notes = '' } = req.body;
      console.log('解析参数:', { customer_name, customer_phone, customer_email, school_name, valid_days, max_users, notes });

      const licenseCode = licenseService.generateLicenseCode();
      const formattedCode = licenseService.formatLicenseCode(licenseCode);
      console.log('生成授权码:', formattedCode);

      const qrData = 'LICENSE:' + licenseCode;
      const qrCode = await licenseService.generateQRCode(qrData);
      console.log('二维码生成成功，长度:', qrCode ? qrCode.length : 'null');

      const validStart = new Date().toISOString().split('T')[0];
      const validEnd = valid_days
        ? new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      console.log('有效期:', validStart, '至', validEnd);

      const result = queryRun(
        'INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [licenseCode, qrCode, customer_name, customer_phone, customer_email, school_name, validStart, validEnd || '', max_users, req.body.created_by || 1, new Date().toISOString(), notes]
      );
      console.log('数据库插入成功，ID:', result.lastID);

      res.json({
        success: true,
        id: result.lastID,
        license_code: formattedCode,
        qr_code: qrCode,
        valid_start: validStart,
        valid_end: validEnd
      });
      console.log('响应已发送');
    } catch (err) {
      console.error('❌ 生成授权码失败:', err.message, err.stack);
      res.status(500).json({ success: false, message: err.message });
    }
  });

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
      res.json({ success: true, data: licenses });
    } catch (err) {
      console.error('❌ 获取授权码列表失败:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/license/stats', (req, res) => {
    try {
      const total = queryOne('SELECT COUNT(*) as count FROM licenses').count;
      const active = queryOne('SELECT COUNT(*) as count FROM licenses WHERE status = "active"').count;
      const used = queryOne('SELECT COUNT(*) as count FROM licenses WHERE status = "used"').count;
      const expired = queryOne('SELECT COUNT(*) as count FROM licenses WHERE status = "expired"').count;
      const revoked = queryOne('SELECT COUNT(*) as count FROM licenses WHERE status = "revoked"').count;
      res.json({ success: true, data: { total, active, used, expired, revoked } });
    } catch (err) {
      console.error('❌ 获取统计失败:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  const server = app.listen(PORT, () => {
    console.log('✅ 服务器启动，端口:', PORT);
    
    // 5秒后测试 API
    setTimeout(() => {
      console.log('\n=== 测试 /api/license/generate ===');
      const postData = JSON.stringify({
        customer_name: '测试学校',
        customer_phone: '13800000000',
        customer_email: 'test@test.com',
        school_name: '测试学校',
        valid_days: 365,
        max_users: 100,
        notes: 'API测试'
      });
      
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/license/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('状态码:', res.statusCode);
          console.log('响应:', data);
          
          console.log('\n=== 测试 /api/license ===');
          http.get('http://localhost:' + PORT + '/api/license', (res2) => {
            let data2 = '';
            res2.on('data', (chunk) => data2 += chunk);
            res2.on('end', () => {
              console.log('状态码:', res2.statusCode);
              try {
                const parsed = JSON.parse(data2);
                console.log('记录数:', parsed.data ? parsed.data.length : 0);
                if (parsed.data && parsed.data.length > 0) {
                  console.log('最后一条:', {
                    id: parsed.data[0].id,
                    formatted_code: parsed.data[0].formatted_code,
                    customer_name: parsed.data[0].customer_name,
                    status: parsed.data[0].status
                  });
                }
              } catch (e) {
                console.log('响应:', data2);
              }
              console.log('\n✅ 测试完成，服务器继续运行在端口 ' + PORT);
              console.log('可以按 Ctrl+C 停止');
            });
          });
        });
      });
      req.on('error', (e) => console.error('请求错误:', e.message));
      req.write(postData);
      req.end();
    }, 2000);
  });
})();
