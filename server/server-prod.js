const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

console.log('📥 加载后端API路由...');

const studentRoutes = require('./routes/student');
const parentRoutes = require('./routes/parent');
const teacherRoutes = require('./routes/teacher');
const notificationRoutes = require('./routes/notification');
const exportRoutes = require('./routes/export');
const userRoutes = require('./routes/users');
const abnormalRoutes = require('./routes/abnormal');
const licenseRoutes = require('./routes/license');

app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/abnormal', abnormalRoutes);
app.use('/api/license', licenseRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Health Management System',
    version: '1.0.0'
  });
});

const distPath = path.join(__dirname, '../dist');
console.log('📦 检查前端构建目录:', distPath);

const fs = require('fs');
if (fs.existsSync(distPath)) {
  console.log('🌐 启用前端静态文件服务');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  console.log('✅ 前端静态文件服务已启用');
} else {
  console.log('⚠️ 前端构建目录不存在，仅提供API服务');
  app.get('/', (req, res) => {
    res.json({
      name: 'Health Management System',
      version: '1.0.0',
      description: 'A complete health management system for schools',
      status: 'running',
      api_endpoints: {
        users: '/api/users',
        student: '/api/student',
        teacher: '/api/teacher',
        parent: '/api/parent',
        abnormal: '/api/abnormal',
        notification: '/api/notification',
        health: '/api/health'
      }
    });
  });
}

async function initDatabase() {
  console.log('🗄️ 初始化数据库...');
  const initSqlJs = require('sql.js');
  const dbPath = path.join(__dirname, 'database/health_management.db');
  
  try {
    const SQL = await initSqlJs();
    let db;
    
    if (fs.existsSync(dbPath)) {
      console.log('📁 数据库文件已存在，加载中...');
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      console.log('📝 数据库文件不存在，创建新数据库...');
      db = new SQL.Database();
      
      const schemaPath = path.join(__dirname, 'database/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('🔧 执行数据库初始化脚本...');
      db.exec(schemaSql);
      
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      console.log('💾 数据库已保存');
    }
    
    db.close();
    console.log('✅ 数据库初始化完成');
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
    throw err;
  }
}

async function startServer() {
  try {
    await initDatabase();
    
    const { Database } = require('./database/db');
    await Database.init();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(60));
      console.log('  🎉 健康管理系统 - 完整部署版本');
      console.log('='.repeat(60));
      console.log('  🚀 服务已启动: http://localhost:' + PORT);
      console.log('  🌐 健康检查: http://localhost:' + PORT + '/api/health');
      console.log('  📦 数据库: SQLite - health_management.db');
      console.log('  ✅ 数据库已就绪');
      console.log('='.repeat(60));
      console.log('');
    });
  } catch (err) {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
}

startServer();