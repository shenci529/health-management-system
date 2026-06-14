const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
  res.json({
    name: 'Health Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

if (process.env.NODE_ENV === 'production') {
  const serverless = require('serverless-http');
  module.exports.handler = serverless(app);
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
