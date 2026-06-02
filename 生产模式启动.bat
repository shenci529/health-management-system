@echo off
chcp 65001 >nul
echo ============================================================
echo    🚀 健康管理系统 - 生产模式启动
echo ============================================================
echo.
echo 正在检查依赖...
if not exist "node_modules" (
    echo ❌ 未安装依赖，请先运行"部署准备.bat"
    pause
    exit
)

if not exist "dist" (
    echo ❌ 未构建前端，请先运行"部署准备.bat"
    pause
    exit
)

echo.
echo ============================================================
echo    🎉 启动生产模式服务...
echo ============================================================
echo.
echo 🌐 访问地址:
echo    - 本机访问:  http://localhost:3002
echo    - 局域网:    http://192.168.3.25:3002
echo    - API接口:   http://localhost:3002/api/health
echo.
echo ============================================================
echo.
echo 按 Ctrl+C 可以停止服务
echo.
cd server
set NODE_ENV=production
node server-prod.js
pause
