@echo off
chcp 65001 >nul
echo ============================================================
echo    🏠 幼儿中小学生健康管理系统 - 部署准备
echo ============================================================
echo.
echo [1/5] 检查Node.js环境...
node -v
if %errorlevel% neq 0 (
    echo ❌ 未安装Node.js，请先安装！
    pause
    exit
)
echo ✅ Node.js环境检查通过
echo.

echo [2/5] 安装项目依赖...
echo 正在安装...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败！
    pause
    exit
)
echo ✅ 前端依赖安装成功
echo.

echo [3/5] 安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败！
    cd ..
    pause
    exit
)
cd ..
echo ✅ 后端依赖安装成功
echo.

echo [4/5] 初始化数据库...
cd server
if exist database\health_management.db (
    echo ✅ 数据库已存在
) else (
    echo 正在创建数据库...
    call node database/init.js
)
cd ..
echo ✅ 数据库准备完成
echo.

echo [5/5] 构建前端...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败！
    pause
    exit
)
echo ✅ 前端构建成功
echo.

echo ============================================================
echo    ✅ 部署准备已完成！
echo ============================================================
echo.
echo 📦 你现在可以：
echo    1. 运行 生产模式启动.bat - 启动完整服务
echo    2. 上传到 GitHub 后部署到 Railway
echo    3. 或部署到其他云平台
echo.
echo ============================================================
pause
