const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== 数据库初始化 ====================
const { Database } = require('./database/db');
(async () => {
  try {
    await Database.init();
    console.log('✅ 数据库初始化成功');
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
  }
})();

// ==================== API 路由 ====================
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

// 班级动态 API（图片/视频上传）
const classPostsRoutes = require('./routes/classPosts');
app.use('/api/class-posts', classPostsRoutes);

// 班级列表接口（供前端下拉框使用）
app.get('/api/classes', (req, res) => {
  try {
    const classes = Database.all('SELECT id, name, capacity, grade_id FROM classes ORDER BY grade_id, id');
    res.json({ success: true, data: classes });
  } catch (err) {
    console.error('获取班级列表失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 提供上传的图片/视频文件（静态资源）
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath, { maxAge: '30d' }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Health Management System',
    version: '1.0.0'
  });
});

// ==================== 前端静态文件服务 ====================
// 当 dist 目录存在时，提供前端页面；不存在时根路径返回 API 信息
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('📦 提供前端静态文件: ' + distPath);
  app.use(express.static(distPath));
  // SPA fallback：非 API 请求返回 index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
} else {
  console.log('⚠️  未找到 dist 目录，仅提供 API 服务');
  app.get('/', (req, res) => {
    res.json({
      name: 'Health Management System API',
      version: '1.0.0',
      status: 'running'
    });
  });
}

// ==================== 启动服务器 ====================
if (process.env.NODE_ENV === 'production') {
  const serverless = require('serverless-http');
  module.exports.handler = serverless(app);
} else {
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
}
