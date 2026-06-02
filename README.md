# 🏥 幼儿中小学生健康管理系统

## 🌟 功能介绍

一个完整的校园健康管理系统，支持：
- 👨‍👩‍👧‍👦 用户管理（管理员、教师、学生、家长、校医）
- 🏫 班级管理
- 📋 健康档案
- 🚨 异常处理
- 📊 数据统计
- 💬 消息通知
- 📈 数据分析

---

## 🚀 一键部署到 Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

---

## 📦 本地运行

```bash
# 安装依赖
npm install
cd server && npm install && cd ..

# 初始化数据库
cd server && node database/init.js && cd ..

# 构建前端
npm run build

# 启动服务
npm start
```

访问 http://localhost:3002

---

## 🔐 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 教师 | teacher1 | 123456 |
| 学生 | student1 | 123456 |
| 家长 | parent1 | 123456 |
| 校医 | doctor1 | 123456 |

---

## 🛠️ 技术栈

- **前端**：Vue.js 2 + Element UI + Vite
- **后端**：Node.js + Express
- **数据库**：SQLite
- **部署**：Railway

---

## 📝 说明

- 使用 SQLite 数据库，自动保存
- 前后端集成部署，单端口访问
- 支持局域网和公网部署

---

✨ Have fun!
