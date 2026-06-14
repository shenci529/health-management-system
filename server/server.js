const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

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
    res.json({
      name: '幼儿中小学生健康管理系统API',
      version: '1.0.0',
      description: '提供学生、家长、教师端的健康数据管理API服务'
    });
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

  app.post('/api/parent/send-code', (req, res) => {
    res.json({ success: true, message: '验证码已发送（测试验证码：123456）' });
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

  app.use((req, res) => {
    res.status(404).json({ success: false, message: '请求的资源不存在', path: req.url });
  });

  app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  幼儿中小学生健康管理系统 - 后端API服务');
    console.log('========================================');
    console.log(`  服务已启动: http://localhost:${PORT}`);
    console.log(`  健康检查: http://localhost:${PORT}/api/health`);
    console.log('  默认账号: admin / admin123');
    console.log('========================================');
  });
})();
