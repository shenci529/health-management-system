const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { Database } = require('./database/db');
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

app.get('/', (req, res) => {
  res.json({
    name: 'Health Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

(async () => {
  try {
    await Database.init();
    console.log('✅ 数据库初始化成功');
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
  }

  if (process.env.NODE_ENV === 'production') {
    const serverless = require('serverless-http');
    module.exports.handler = serverless(app);
  } else {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('========================================');
      console.log('  幼儿中小学生健康管理系统 - 后端API服务');
      console.log('========================================');
      console.log(`  服务已启动: http://localhost:${PORT}`);
      console.log(`  健康检查: http://localhost:${PORT}/api/health`);
      console.log('  默认账号: admin / admin123');
      console.log('========================================');
    });
  }
})();
