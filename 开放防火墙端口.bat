@echo off
chcp 65001 > nul
echo ========================================
echo   开放防火墙端口（需要管理员权限）
echo ========================================
echo.

echo 正在开放端口 3000 和 3002...

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  需要管理员权限！
    echo 请右键选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 开放端口
netsh advfirewall firewall add rule name="健康管理系统-前端3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="健康管理系统-后端3002" dir=in action=allow protocol=TCP localport=3002

echo.
echo ✅ 端口已开放！
echo.
echo 现在可以通过以下地址访问：
echo.
echo 📱 手机/其他电脑访问：
echo    前端: http://192.168.3.25:3000
echo    后端: http://192.168.3.25:3002
echo.
echo 🌐 如果需要公网访问：
echo    请查看"免费公网方案.md"
echo.
pause
