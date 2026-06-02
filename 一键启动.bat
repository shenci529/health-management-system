@echo off
chcp 65001 >nul
title 健康管理系统 - 微信公众号测试

echo ========================================
echo   健康管理系统 - 一键启动工具
echo ========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 建议以管理员身份运行此脚本
    echo.
)

:: 设置Node.js路径
set NODE_HOME=C:\Program Files\nodejs
set PATH=%NODE_HOME%;%PATH%

:: 检查Node.js
echo [1/5] 检查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Node.js，请先安装
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo   Node.js已就绪

:: 检查npm
echo.
echo [2/5] 检查npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到npm
    pause
    exit /b 1
)
echo   npm已就绪

:: 安装依赖
echo.
echo [3/5] 安装项目依赖...
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo   依赖已安装，跳过
)

:: 启动开发服务器
echo.
echo [4/5] 启动开发服务器...
echo.
start "健康管理系统 - 开发服务器" cmd /k "cd /d %CD% && npm run dev"
timeout /t 5 /nobreak >nul

:: 检查服务器是否启动
echo   服务器启动中...

:: 提示内网穿透
echo.
echo [5/5] 配置信息
echo ========================================
echo.
echo   本地访问地址: http://localhost:3000
echo.
echo   接下来需要配置内网穿透：
echo   1. 下载ngrok: https://ngrok.com/download
echo   2. 注册ngrok账号获取token
echo   3. 运行: ngrok http 3000
echo   4. 复制ngrok提供的HTTPS地址
echo   5. 在微信公众号后台配置授权域名
echo   6. 在公众号中访问测试
echo.
echo ========================================
echo.
echo   按任意键打开项目文件夹...
pause >nul
explorer "%CD%"
