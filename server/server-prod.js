const express = require('express');
const path = require('path');
const cors = require('cors');
const { Database } = require('./database/db');

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

app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/abnormal', abnormalRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Health Management System',
    version: '1.0.0'
  });
});

const distPath = path.join(__dirname, '../dist');
console.log(`📦 检查前端构建目录:', distPath);

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

async function startServer() {
  try {
    await Database.init();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(60));
      console.log('  🎉 健康管理系统 - 完整部署版本');
      console.log('='.repeat(60));
      console.log(`  🚀 服务已启动: http://localhost:' + PORT);
      console.log(`  🌐 健康检查: http://localhost:' + PORT + '/api/health');
      console.log(`  📦 数据库: SQLite - health_management.db');
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
