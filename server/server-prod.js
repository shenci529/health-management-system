const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 记录请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==============================
// 后端API路由
// ==============================
console.log('📥 加载后端API路由...');

// 引入各个路由模块
const studentRoutes = require('./routes/student');
const parentRoutes = require('./routes/parent');
const teacherRoutes = require('./routes/teacher');
const notificationRoutes = require('./routes/notification');
const exportRoutes = require('./routes/export');
const userRoutes = require('./routes/users');
const abnormalRoutes = require('./routes/abnormal');

// 挂载API路由
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/abnormal', abnormalRoutes);

// ==============================
// 健康检查API
// ==============================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Health Management System',
    version: '1.0.0'
  });
});

// ==============================
// 前端静态文件服务
// ==============================
const distPath = path.join(__dirname, '../dist');
console.log(`📦 检查前端构建目录: ${distPath}`);

if (fs.existsSync(distPath)) {
  console.log('🌐 启用前端静态文件服务');
  
  // 托管前端构建文件
  app.use(express.static(distPath));
  
  // SPA fallback：所有其他非API路由返回index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  
  console.log('✅ 前端静态文件服务已启用');
} else {
  console.log('⚠️ 前端构建目录不存在，仅提供API服务');
  // 如果没有前端文件，返回API文档
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

// ==============================
// 启动服务器
// ==============================
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('  🎉 健康管理系统 - 完整部署版本');
  console.log('='.repeat(60));
  console.log(`  🚀 服务已启动: http://localhost:${PORT}`);
  console.log(`  🌐 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`  📦 数据库: SQLite - health_management.db`);
  
  const dbExists = fs.existsSync(path.join(__dirname, 'database', 'health_management.db'));
  if (dbExists) {
    console.log(`  ✅ 数据库已就绪`);
  } else {
    console.log(`  ⚠️ 数据库不存在，将自动初始化`);
  }
  
  console.log('='.repeat(60));
  console.log('');
});
