// ==================== 幼儿中小学生健康管理系统 - 后端API服务 ====================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Database } = require('./database/db');

// Railway暴露的环境变量
const PORT = process.env.PORT || 3002;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').filter(Boolean);

// 数据库自动初始化（Railway冷启动时运行）
async function initDatabase() {
  const dbDir = path.join(__dirname, 'database');
  const schemaPath = path.join(dbDir, 'schema.sql');
  const initScript = path.join(dbDir, 'init.js');
  const localDbPath = path.join(dbDir, 'health_management.db');
  if (!fs.existsSync(localDbPath) && fs.existsSync(schemaPath)) {
    console.log('检测到数据库不存在，正在初始化...');
    const { execSync } = require('child_process');
    try {
      execSync(`node "${initScript}"`, { stdio: 'inherit' });
      console.log('数据库初始化完成');
    } catch (err) {
      console.error('数据库初始化失败:', err.message);
    }
  }
}

// ==================== 主程序入口 ====================
(async () => {
  // 1) 初始化数据库
  await initDatabase();
  await Database.init();
  console.log('数据库就绪');

  // 2) 创建Express应用
  const app = express();

  // 3) 中间件配置
  app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 请求日志
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // 4) 路由挂载
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

  // 5) API端点
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

  // 6) 错误处理
  app.use((req, res) => {
    res.status(404).json({ success: false, message: '请求的资源不存在', path: req.url });
  });

  app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  });

  // 7) 启动监听
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
