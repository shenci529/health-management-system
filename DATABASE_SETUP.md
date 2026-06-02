# 本地数据库设置指南

## 📋 概述

本系统使用 **SQLite** 作为本地数据库，无需安装额外的数据库服务器，所有数据存储在本地文件中，完全脱离云端。

---

## 🚀 快速开始

### 1. 安装后端依赖

首先，进入 `server` 目录并安装依赖：

```bash
cd server
npm install
```

### 2. 初始化数据库

运行数据库初始化脚本：

```bash
# 方法1：使用 server 目录下的脚本
cd server
npm run init-db

# 或方法2：在项目根目录运行
npm run db:init
```

这个脚本会：
- 创建 `server/database/health_management.db` 数据库文件
- 创建所有必要的数据表
- 插入初始数据（管理员账号、年级、班级等）

### 3. 启动后端服务

```bash
# 在 server 目录下
npm start

# 或在项目根目录
npm run server
```

后端服务将在 `http://localhost:3002` 启动

---

## 📁 项目结构

```
server/
├── database/
│   ├── schema.sql           # 数据库表结构定义
│   ├── init.js             # 数据库初始化脚本
│   ├── db.js               # 数据库连接和操作模块
│   └── health_management.db # SQLite数据库文件（运行后生成）
├── routes/
│   ├── users.js            # 用户相关API路由（新增）
│   └── ...                 # 其他路由
├── server.js               # 后端服务入口
└── package.json            # 后端依赖配置
```

---

## 🗄️ 数据库表结构

系统包含以下主要数据表：

### 👥 用户与权限
- `users` - 用户表（管理员、教师、家长、学生、校医）
- `roles` - 角色权限表
- `grades` - 年级表
- `classes` - 班级表
- `students` - 学生详细信息表

### 🩺 健康相关
- `health_records` - 学生健康档案
- `allergy_history` - 过敏史表
- `medical_history` - 既往病史表
- `morning_checks` - 晨检记录表
- `absence_records` - 缺勤记录表
- `disease_warnings` - 传染病预警表
- `isolation_records` - 隔离管理表

### 🍽️ 膳食与活动
- `recipes` - 食谱表
- `dining_records` - 就餐记录表
- `sports_activities` - 体育活动表
- `activity_signups` - 活动报名记录表
- `health_tasks` - 健康任务表
- `task_completions` - 任务完成记录表

### 📢 通知与沟通
- `notifications` - 通知表
- `messages` - 家校沟通消息表

### 💊 其他
- `medical_supplies` - 医疗物资表
- `health_resources` - 健康知识库表
- `audit_logs` - 系统审计日志表

---

## 🔑 默认账号

初始化数据库后，可以使用以下账号登录：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 超级管理员 | 完整系统权限 |

---

## 🔌 API 接口示例

### 用户管理接口

#### 获取所有用户
```
GET http://localhost:3002/api/users
```

#### 获取单个用户
```
GET http://localhost:3002/api/users/1
```

#### 创建用户
```
POST http://localhost:3002/api/users
Content-Type: application/json

{
  "username": "teacher1",
  "password": "123456",
  "role": "teacher",
  "real_name": "张老师",
  "gender": "男",
  "phone": "13800138000"
}
```

#### 更新用户
```
PUT http://localhost:3002/api/users/2
Content-Type: application/json

{
  "real_name": "张小明老师",
  "phone": "13900139000"
}
```

#### 删除用户
```
DELETE http://localhost:3002/api/users/3
```

#### 用户登录
```
POST http://localhost:3002/api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## 💾 数据库操作示例

在你的后端代码中使用数据库：

```javascript
const { Database } = require('./database/db');

// 查询所有用户
const users = await Database.all('SELECT * FROM users');

// 查询单个用户
const user = await Database.get('SELECT * FROM users WHERE id = ?', [userId]);

// 插入数据
const result = await Database.run(
  'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
  ['testuser', 'password123', 'student']
);

// 更新数据
await Database.run(
  'UPDATE users SET real_name = ? WHERE id = ?',
  ['新名字', userId]
);

// 删除数据
await Database.run('DELETE FROM users WHERE id = ?', [userId]);
```

---

## 🔄 常见问题

### 1. 如何备份数据库？
直接复制 `server/database/health_management.db` 文件即可。

### 2. 如何重置数据库？
删除 `server/database/health_management.db` 文件，然后重新运行初始化脚本。

### 3. 如何查看数据库内容？
可以使用以下工具查看 SQLite 数据库：
- DB Browser for SQLite（免费开源）
- VS Code 扩展：SQLite Viewer
- 在线工具：sqliteviewer.app

### 4. 端口被占用怎么办？
修改 `server/server.js` 中的端口号：
```javascript
const PORT = 3002; // 改成其他端口
```

### 5. 如何添加新的数据表？
在 `server/database/schema.sql` 中添加新的 CREATE TABLE 语句，然后重新初始化数据库。

---

## 📝 下一步

数据库设置完成后，你可以：
1. 启动前端 `npm run dev`（在根目录）
2. 启动后端 `npm run server`（在根目录）
3. 使用 admin/admin123 登录系统
4. 开始使用完整的本地数据库功能！

---

## 🆘 需要帮助？

如果遇到问题，请检查：
1. Node.js 版本是否 >= 14.0
2. 是否在 server 目录下运行了 `npm install`
3. 端口 3002 是否被其他程序占用
4. 控制台是否有错误信息

祝你使用愉快！🎉
