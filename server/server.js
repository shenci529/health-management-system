const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const smsService = require('./smsService');
const licenseService = require('./licenseService');

const PORT = process.env.PORT || 3002;

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
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  const stmt = dbInstance.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
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

function queryExec(sql) {
  if (!dbInstance) throw new Error('数据库未初始化');
  dbInstance.exec(sql);
  saveDatabase();
}

(async () => {
  await initDatabase();
  console.log('数据库就绪');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.get('/', (req, res) => {
    const distPath = path.join(__dirname, '../dist');
    if (fs.existsSync(distPath)) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.json({
        name: '幼儿中小学生健康管理系统API',
        version: '1.0.0',
        description: '提供学生、家长、教师端的健康数据管理API服务'
      });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/users/login', (req, res) => {
    try {
      const { username, password } = req.body;
      const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);
      if (!user) {
        return res.json({ success: false, message: '用户不存在' });
      }
      if (user.password !== password) {
        return res.json({ success: false, message: '密码错误' });
      }
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } catch (err) {
      console.error('登录错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  });

  app.get('/api/users', (req, res) => {
    try {
      const users = queryAll('SELECT id, username, name, role, created_at FROM users');
      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const { username, password, name, role } = req.body;
      const result = queryRun('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', 
        [username, password || '123456', name || username, role || 'teacher']);
      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/student', (req, res) => {
    try {
      const students = queryAll('SELECT * FROM students');
      res.json({ success: true, data: students });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/student', (req, res) => {
    try {
      const { name, student_no, grade, class_name, gender, birth_date, parent_name, parent_phone } = req.body;
      const result = queryRun(`INSERT INTO students (name, student_no, grade, class, gender, birth_date, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, student_no, grade, class_name, gender || '男', birth_date, parent_name, parent_phone]);
      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/parent', (req, res) => {
    try {
      const parents = queryAll('SELECT * FROM parents');
      res.json({ success: true, data: parents });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/parent/login', (req, res) => {
    try {
      const { phone, code } = req.body;
      const parent = queryOne('SELECT * FROM parents WHERE phone = ?', [phone]);
      if (!parent) {
        return res.json({ success: false, message: '手机号未注册' });
      }
      if (code !== '123456') {
        return res.json({ success: false, message: '验证码错误' });
      }
      res.json({ success: true, parent: { id: parent.id, name: parent.name, phone: parent.phone, student_id: parent.student_id } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/parent/send-code', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.json({ success: false, message: '请输入手机号' });
      }
      
      if (!smsService.isValidPhone(phone)) {
        return res.json({ success: false, message: '手机号格式不正确' });
      }
      
      const code = smsService.generateCode();
      
      const result = await smsService.sendVerifyCode(phone, code);
      
      // 开发模式下打印验证码方便测试
      if (result.mock) {
        console.log('📱 模拟短信验证码:', code);
      }
      
      if (result.success) {
        res.json({ success: true, message: result.message, mock: result.mock });
      } else {
        res.json({ success: false, message: result.message });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/teacher', (req, res) => {
    try {
      const teachers = queryAll('SELECT * FROM teachers');
      res.json({ success: true, data: teachers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/abnormal', (req, res) => {
    try {
      const records = queryAll('SELECT * FROM abnormal_records ORDER BY created_at DESC LIMIT 100');
      res.json({ success: true, data: records });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/abnormal', (req, res) => {
    try {
      const { student_id, type, description, status } = req.body;
      const result = queryRun('INSERT INTO abnormal_records (student_id, type, description, status) VALUES (?, ?, ?, ?)',
        [student_id, type, description, status || '待处理']);
      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/abnormal/stats', (req, res) => {
    try {
      const pending = queryOne("SELECT COUNT(*) as count FROM abnormal_records WHERE status = '待处理'");
      const resolved = queryOne("SELECT COUNT(*) as count FROM abnormal_records WHERE status = '已处理'");
      res.json({ 
        success: true, 
        data: { 
          pending: pending ? pending.count : 0, 
          resolved: resolved ? resolved.count : 0 
        } 
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/abnormal/:id/handle', (req, res) => {
    try {
      const { remark } = req.body;
      queryRun("UPDATE abnormal_records SET status = '已处理', handle_remark = ?, handled_at = ? WHERE id = ?",
        [remark || '已处理', new Date().toISOString(), req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/notification', (req, res) => {
    try {
      const notifications = queryAll('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
      res.json({ success: true, data: notifications });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/notification', (req, res) => {
    try {
      const { title, content, target_role } = req.body;
      const result = queryRun('INSERT INTO notifications (title, content, target_role) VALUES (?, ?, ?)',
        [title, content, target_role || 'all']);
      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/license/generate', async (req, res) => {
    try {
      const { customer_name = '', customer_phone = '', customer_email = '', school_name = '', valid_days = 365, max_users = 100, notes = '' } = req.body;
      
      const licenseCode = licenseService.generateLicenseCode();
      const formattedCode = licenseService.formatLicenseCode(licenseCode);
      
      const qrData = `LICENSE:${licenseCode}`;
      const qrCode = await licenseService.generateQRCode(qrData);
      
      const validStart = new Date().toISOString().split('T')[0];
      const validEnd = valid_days 
        ? new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      
      const result = queryRun(
        'INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [licenseCode, qrCode, customer_name, customer_phone, customer_email, school_name, validStart, validEnd || '', max_users, req.body.created_by || 1, new Date().toISOString(), notes]
      );
      
      res.json({
        success: true,
        id: result.lastID,
        license_code: formattedCode,
        qr_code: qrCode,
        valid_start: validStart,
        valid_end: validEnd
      });
    } catch (err) {
      console.error('生成授权码失败:', err);
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
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/license/:id', (req, res) => {
    try {
      const license = queryOne('SELECT * FROM licenses WHERE id = ?', [req.params.id]);
      if (!license) {
        return res.json({ success: false, message: '授权码不存在' });
      }
      
      if (license.license_code) {
        license.formatted_code = licenseService.formatLicenseCode(license.license_code);
      }
      
      res.json({ success: true, data: license });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/license/:id/activate', (req, res) => {
    try {
      const { code, activated_by } = req.body;
      
      const cleanCode = licenseService.cleanLicenseCode(code);
      const license = queryOne('SELECT * FROM licenses WHERE license_code = ? AND id = ?', [cleanCode, req.params.id]);
      
      if (!license) {
        return res.json({ success: false, message: '授权码不存在或不匹配' });
      }
      
      if (license.status !== 'active') {
        return res.json({ success: false, message: '授权码已失效' });
      }
      
      if (license.valid_end && new Date(license.valid_end) < new Date()) {
        queryRun('UPDATE licenses SET status = ? WHERE id = ?', ['expired', req.params.id]);
        return res.json({ success: false, message: '授权码已过期' });
      }
      
      queryRun(
        'UPDATE licenses SET status = ?, activated_at = ?, activated_by = ? WHERE id = ?',
        ['used', new Date().toISOString(), activated_by || 'unknown', req.params.id]
      );
      
      res.json({ success: true, message: '授权激活成功' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/license/:id/revoke', (req, res) => {
    try {
      queryRun('UPDATE licenses SET status = ? WHERE id = ?', ['revoked', req.params.id]);
      res.json({ success: true, message: '授权已撤销' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/license/validate', (req, res) => {
    try {
      const { code } = req.body;
      
      if (!licenseService.validateLicenseCode(code)) {
        return res.json({ success: false, message: '授权码格式不正确' });
      }
      
      const cleanCode = licenseService.cleanLicenseCode(code);
      const license = queryOne('SELECT * FROM licenses WHERE license_code = ?', [cleanCode]);
      
      if (!license) {
        return res.json({ success: false, message: '授权码不存在' });
      }
      
      if (license.status === 'revoked') {
        return res.json({ success: false, message: '授权码已被撤销' });
      }
      
      if (license.status === 'expired') {
        return res.json({ success: false, message: '授权码已过期' });
      }
      
      if (license.status === 'used') {
        return res.json({ success: false, message: '授权码已被使用' });
      }
      
      if (license.valid_end && new Date(license.valid_end) < new Date()) {
        queryRun('UPDATE licenses SET status = ? WHERE id = ?', ['expired', license.id]);
        return res.json({ success: false, message: '授权码已过期' });
      }
      
      res.json({
        success: true,
        data: {
          id: license.id,
          formatted_code: licenseService.formatLicenseCode(license.license_code),
          customer_name: license.customer_name,
          school_name: license.school_name,
          valid_end: license.valid_end,
          max_users: license.max_users
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/license/:id', (req, res) => {
    try {
      queryRun('DELETE FROM licenses WHERE id = ?', [req.params.id]);
      res.json({ success: true, message: '授权已删除' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/license/stats', (req, res) => {
    try {
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
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 生成临时激活二维码（扫码激活用）
  app.post('/api/license/qr-generate', async (req, res) => {
    try {
      // 生成一个临时token用于扫码激活
      const tempToken = 'TEMP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

      const qrData = JSON.stringify({
        type: 'activate',
        token: tempToken,
        expire: expireTime.toISOString()
      });

      const qrCode = await licenseService.generateQRCode(qrData, { width: 200 });

      res.json({
        success: true,
        qr_code: qrCode,
        temp_token: tempToken,
        expire_time: expireTime.toLocaleString()
      });
    } catch (err) {
      console.error('生成二维码失败:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 获取授权信息（不带验证，仅用于展示）
  app.get('/api/license/info', (req, res) => {
    try {
      const licenseInfo = queryOne('SELECT * FROM licenses WHERE status = "used" ORDER BY activated_at DESC LIMIT 1');
      if (licenseInfo) {
        licenseInfo.formatted_code = licenseService.formatLicenseCode(licenseInfo.license_code);
      }
      res.json({
        success: true,
        data: licenseInfo
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==================== 前端静态文件服务（dist 目录）====================
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    console.log('📦 提供前端静态文件: ' + distPath);
    app.use(express.static(distPath));
    // SPA fallback: 非 API 请求返回 index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('⚠️  未找到 dist 目录，仅提供 API 服务');
  }

  app.use((req, res) => {
    res.status(404).json({ success: false, message: '请求的资源不存在', path: req.url });
  });

  app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  幼儿中小学生健康管理系统');
    console.log('========================================');
    console.log(`  前端页面: http://localhost:${PORT}`);
    console.log(`  健康检查: http://localhost:${PORT}/api/health`);
    console.log(`  授权列表: http://localhost:${PORT}/api/license`);
    console.log('  默认账号: admin / admin123');
    console.log('========================================');
  });
})();
