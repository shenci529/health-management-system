@echo off
chcp 65001 > nul
echo ========================================
echo   幼儿中小学生健康管理系统
echo   局域网一键启动
echo ========================================
echo.
echo 📍 服务器IP: 192.168.3.25
echo.
echo 🔍 正在检查端口占用...
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 3000 已被占用！
    echo    请关闭占用端口的程序后重试
    pause
    exit /b 1
)

netstat -ano | findstr ":3002" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 3002 已被占用！
    echo    请关闭占用端口的程序后重试
    pause
    exit /b 1
)

echo ✅ 端口检查通过
echo.
echo 📦 正在安装依赖...

:: 安装前端依赖
cd ..
npm install --silent >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  前端依赖安装失败！
    echo    请手动运行: npm install
    pause
    exit /b 1
)

:: 安装后端依赖
cd server
call npm install --silent >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  后端依赖安装失败！
    echo    请手动运行: cd server ^&^& npm install
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.
echo 🗄️  正在初始化数据库...
node database/init.js >nul 2>&1
echo ✅ 数据库初始化完成
echo.
echo 🚀 正在启动服务...
echo.

:: 启动后端
start "后端服务" cmd /k "cd /d %~dp0server && node server.js"

:: 等待后端启动
timeout /t 3 >nul

:: 启动前端
start "前端服务" cmd /k "cd /d %~dp0 && npm run dev"

:: 等待前端启动
timeout /t 5 >nul

:: 打开浏览器
start http://192.168.3.25:3000

echo.
echo ========================================
echo   ✅ 启动成功！
echo ========================================
echo.
echo 📱 访问地址：
echo.
echo    🌐 本机访问：
echo       http://localhost:3000
echo.
echo    📱 局域网访问（手机/其他电脑）：
echo       http://192.168.3.25:3000
echo.
echo    🔧 后端API：
echo       http://192.168.3.25:3002
echo.
echo.
echo 📋 默认登录账号：
echo    管理员: admin / 123456
echo    教师: teacher1 / 123456
echo    校医: doctor1 / 123456
echo.
echo.
echo ⚠️  重要提示：
echo    1. 如果手机无法访问，请先运行"开放防火墙端口.bat"
echo    2. 确保手机和电脑在同一WiFi网络下
echo    3. 查看"免费公网方案.md"获取更多访问方式
echo.
echo 按任意键打开浏览器演示...
pause >nul

start http://192.168.3.25:3000
