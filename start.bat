@echo off
chcp 65001 >nul
title 幼儿中小学生健康管理系统

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║         幼儿中小学生健康管理系统               ║
echo ║           政企数字化级别 · 健康管理平台        ║
echo ╚═══════════════════════════════════════════════╝
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js，请先安装 Node.js
    echo     下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装

:: 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：npm 未安装
    pause
    exit /b 1
)

echo ✅ npm 已安装
echo.

:: 检查并安装依赖
echo 📦 检查依赖...
if not exist "node_modules" (
    echo 正在安装前端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo 正在安装后端依赖...
    cd server
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ 依赖检查完成
echo.

:: 初始化数据库
echo 🗄️ 初始化数据库...
if not exist "server\database\health_management.db" (
    cd server
    node database\init.js
    if %errorlevel% neq 0 (
        echo ❌ 数据库初始化失败
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ 数据库初始化完成
echo.

:: 启动后端服务
echo 🚀 启动后端服务...
start "后端服务" cmd /k "cd server && npm start"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端服务
echo 🚀 启动前端服务...
start "前端服务" cmd /k "npm run dev"

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║              服务启动成功！                    ║
echo ║                                              ║
echo ║  前端地址：http://localhost:3000              ║
echo ║  后端地址：http://localhost:3002              ║
echo ║                                              ║
echo ║  演示账号：任意用户名 + 密码 123456           ║
echo ║  可选角色：校级管理员、班主任、家长、学生、校医  ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo 按任意键打开浏览器...
pause >nul
start http://localhost:3000
