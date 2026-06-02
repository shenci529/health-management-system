// 引入必要的Node.js模块
const express = require('express'); // 引入Express框架，用于构建Web应用
const cors = require('cors'); // 引入CORS中间件，用于处理跨域请求
const path = require('path'); // 引入path模块，用于处理文件路径
const fs = require('fs'); // 引入fs模块，用于文件系统操作

// 检查数据库文件是否存在
const dbPath = path.join(__dirname, 'database', 'health_management.db'); // 构建数据库文件的完整路径
const dbExists = fs.existsSync(dbPath); // 检查数据库文件是否存在

// 导入各个功能模块的路由文件
const studentRoutes = require('./routes/student'); // 学生端API路由
const parentRoutes = require('./routes/parent'); // 家长端API路由
const teacherRoutes = require('./routes/teacher'); // 教师端API路由
const notificationRoutes = require('./routes/notification'); // 通知推送API路由
const exportRoutes = require('./routes/export'); // 数据导出API路由
const userRoutes = require('./routes/users'); // 用户管理API路由
const abnormalRoutes = require('./routes/abnormal'); // 异常处理API路由

// 创建Express应用实例
const app = express();
const PORT = 3002; // 后端服务运行的端口号

// 配置中间件（中间件是处理请求的函数，可以在请求到达路由之前或之后执行）
app.use(cors()); // 启用CORS（跨域资源共享），允许前端从不同域名访问后端
app.use(express.json()); // 解析请求体中的JSON格式数据（比如前端发来的POST/PUT请求数据）
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体（比如表单提交的数据）

// 自定义请求日志中间件：记录每个请求的时间、方法和URL
app.use((req, res, next) => {
  const timestamp = new Date().toISOString(); // 获取当前时间的ISO格式字符串
  console.log(`[${timestamp}] ${req.method} ${req.url}`); // 在控制台打印请求日志
  next(); // 调用next()，将请求传递给下一个中间件或路由处理
});

// ==================== 配置API路由 ====================
// 将不同功能的路由挂载到对应的路径前缀下
app.use('/api/student', studentRoutes); // 学生相关API：/api/student/xxx
app.use('/api/parent', parentRoutes); // 家长相关API：/api/parent/xxx
app.use('/api/teacher', teacherRoutes); // 教师相关API：/api/teacher/xxx
app.use('/api/notification', notificationRoutes); // 通知相关API：/api/notification/xxx
app.use('/api/export', exportRoutes); // 导出相关API：/api/export/xxx
app.use('/api/users', userRoutes); // 用户相关API：/api/users/xxx
app.use('/api/abnormal', abnormalRoutes); // 异常处理相关API：/api/abnormal/xxx

// ==================== 根路径API ====================
// 当访问根路径 http://localhost:3002/ 时，返回API文档信息
app.get('/', (req, res) => {
  res.json({
    name: '幼儿中小学生健康管理系统API', // API服务名称
    version: '1.0.0', // API版本号
    description: '提供学生、家长、教师端的健康数据管理API服务', // API描述
    endpoints: { // 列出所有可用的API端点
      student: { // 学生端API列表
        'POST /api/student/morning-check': '晨间健康打卡',
        'POST /api/student/exercise-check': '课间运动打卡',
        'POST /api/student/task-complete': '健康任务完成',
        'GET /api/student/physical-data/:studentId': '获取学生体质数据'
      },
      parent: { // 家长端API列表
        'GET /api/parent/child-health/:childId': '获取孩子健康数据',
        'GET /api/parent/vaccine-reminders/:childId': '疫苗提醒列表',
        'POST /api/parent/health-check-appointment': '体检预约',
        'GET /api/parent/messages': '获取家校沟通消息',
        'POST /api/parent/messages': '发送家校沟通消息'
      },
      teacher: { // 教师端API列表
        'GET /api/teacher/class-health/:classId': '班级健康看板',
        'GET /api/teacher/disease-warning': '传染病预警',
        'GET /api/teacher/recipes': '获取食谱列表',
        'POST /api/teacher/recipes': '添加/更新食谱',
        'GET /api/teacher/vision-posture': '获取视力体态数据',
        'POST /api/teacher/vision-posture': '添加视力体态数据',
        'GET /api/teacher/mental-health': '获取心理健康记录',
        'POST /api/teacher/mental-health': '添加心理健康记录',
        'GET /api/teacher/safety-materials': '获取安全教育素材',
        'POST /api/teacher/safety-materials': '添加安全教育素材'
      },
      common: { // 通用API列表
        'POST /api/notification/send': '消息推送',
        'GET /api/notification/list': '获取通知列表',
        'GET /api/export/:type': '数据导出',
        'GET /api/export/records': '获取导出记录'
      }
    }
  });
});

// ==================== 健康检查API ====================
// 用于检查API服务是否正常运行
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', // 服务状态：正常
    timestamp: new Date().toISOString(), // 当前时间
    uptime: process.uptime() // 进程运行时间（秒）
  });
});

// ==================== 404 未找到处理 ====================
// 当请求的路径不存在时，返回404错误
app.use((req, res) => {
  res.status(404).json({ // 设置HTTP状态码为404
    success: false, // 表示请求失败
    message: '请求的资源不存在', // 错误信息
    path: req.url // 请求的路径
  });
});

// ==================== 错误处理中间件 ====================
// 捕获所有未处理的错误并返回友好的错误响应
app.use((err, req, res, next) => {
  console.error('服务器错误:', err); // 在控制台打印错误信息
  res.status(500).json({ // 设置HTTP状态码为500（服务器内部错误）
    success: false, // 表示请求失败
    message: '服务器内部错误', // 给用户看的错误信息
    // 如果是开发环境，返回具体的错误详情；生产环境不返回，避免暴露敏感信息
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== 启动服务器 ====================
// 让应用开始监听指定端口，接收客户端请求
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('  幼儿中小学生健康管理系统 - 后端API服务');
  console.log('='.repeat(60));
  console.log(`  服务已启动: http://localhost:${PORT}`); // 打印服务访问地址
  console.log(`  API文档: http://localhost:${PORT}`); // 打印API文档地址
  console.log(`  健康检查: http://localhost:${PORT}/api/health`); // 打印健康检查地址
  console.log('');
  
  // 如果数据库文件不存在，给出警告提示
  if (!dbExists) {
    console.log('⚠️  警告: 数据库不存在！');
    console.log('   请先运行: npm run init-db (在server目录)');
    console.log('   或查看: DATABASE_SETUP.md 了解详情');
    console.log('');
  } else {
    console.log('✅ 数据库已就绪');
    console.log(`   默认账号: admin / admin123`);
    console.log('');
  }
  
  // 打印所有可用的API端点清单
  console.log('可用API端点:');
  console.log('');
  console.log('【用户管理API】');
  console.log('  GET    /api/users                       获取用户列表');
  console.log('  GET    /api/users/:id                   获取用户详情');
  console.log('  POST   /api/users                       创建用户');
  console.log('  PUT    /api/users/:id                   更新用户');
  console.log('  DELETE /api/users/:id                   删除用户');
  console.log('  POST   /api/users/login                 用户登录');
  console.log('');
  console.log('【学生端API】');
  console.log('  POST   /api/student/morning-check       晨间健康打卡');
  console.log('  POST   /api/student/exercise-check      课间运动打卡');
  console.log('  POST   /api/student/task-complete       健康任务完成');
  console.log('  GET    /api/student/physical-data/:id   获取学生体质数据');
  console.log('');
  console.log('【家长端API】');
  console.log('  GET    /api/parent/child-health/:id     获取孩子健康数据');
  console.log('  GET    /api/parent/vaccine-reminders/:id 疫苗提醒列表');
  console.log('  POST   /api/parent/health-check-appointment 体检预约');
  console.log('  GET    /api/parent/messages            获取家校沟通消息');
  console.log('  POST   /api/parent/messages             发送家校沟通消息');
  console.log('');
  console.log('【教师端API】');
  console.log('  GET    /api/teacher/class-health/:id    班级健康看板');
  console.log('  GET    /api/teacher/disease-warning     传染病预警');
  console.log('  GET    /api/teacher/recipes             获取食谱列表');
  console.log('  POST   /api/teacher/recipes             添加/更新食谱');
  console.log('  GET    /api/teacher/vision-posture      获取视力体态数据');
  console.log('  POST   /api/teacher/vision-posture       添加视力体态数据');
  console.log('  GET    /api/teacher/mental-health        获取心理健康记录');
  console.log('  POST   /api/teacher/mental-health       添加心理健康记录');
  console.log('  GET    /api/teacher/safety-materials    获取安全教育素材');
  console.log('  POST   /api/teacher/safety-materials     添加安全教育素材');
  console.log('');
  console.log('【通用API】');
  console.log('  POST   /api/notification/send           消息推送');
  console.log('  GET    /api/notification/list           获取通知列表');
  console.log('  GET    /api/export/:type                数据导出');
  console.log('  GET    /api/export/records              获取导出记录');
  console.log('='.repeat(60));
});

// 导出app实例，供其他模块引用（虽然这里主要是为了测试）
module.exports = app;