@echo off
chcp 65001 > nul
echo ========================================
echo   幼儿中小学生健康管理系统 - 部署配置
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Git 状态...
git status > nul 2>&1
if errorlevel 1 (
    echo 错误: 不是 Git 仓库
    pause
    exit /b 1
)
echo ✓ Git 仓库正常
echo.

echo [2/4] 检查代码推送状态...
git remote -v | findstr "github.com" > nul
if errorlevel 1 (
    echo 错误: 未配置 GitHub 远程仓库
    pause
    exit /b 1
)
echo ✓ 远程仓库已配置
echo.

echo [3/4] 配置后端 API 地址...
echo.
echo 请在浏览器中访问: https://dashboard.render.com
echo 查看后端服务状态，获取后端 URL
echo 例如: https://health-management-backend.onrender.com
echo.
set /p backendUrl="请输入 Render 后端 URL（包含 https://）: "

if "%backendUrl%"=="" (
    echo 错误: 后端 URL 不能为空
    pause
    exit /b 1
)

REM 移除末尾的斜杠
if "%backendUrl:~-1%"=="/" set "backendUrl=%backendUrl:~0,-1%"

echo.
echo 后端 API 地址: %backendUrl%
echo.

echo [4/4] 生成部署配置...
echo VITE_API_BASE=%backendUrl% > ".env.production"
echo ✓ 已创建 .env.production 配置文件
echo.

echo ========================================
echo   配置完成！
echo ========================================
echo.
echo 下一步操作：
echo.
echo 1. 打开浏览器访问:
echo    https://github.com/shenci529/health-management-system/settings/variables/actions
echo.
echo 2. 点击 "New repository variable"
echo.
echo 3. Name 填: BACKEND_API_URL
echo.
echo 4. Value 填: %backendUrl%
echo.
echo 5. 点击 "Add variable"
echo.
echo 6. 推送代码触发前端重新构建:
echo    git add .
echo    git commit -m "配置后端API地址"
echo    git push
echo.
echo 7. 等待 3-5 分钟后，访问前端地址测试
echo.

set /p pushNow="是否立即推送代码？(y/n): "
if /i "%pushNow%"=="y" (
    echo.
    echo 正在推送代码...
    git add .
    git commit -m "配置后端API地址"
    git push
    if errorlevel 1 (
        echo.
        echo ✗ 代码推送失败，请检查网络连接
    ) else (
        echo.
        echo ✓ 代码推送成功！
        echo.
        echo 请等待 GitHub Actions 完成前端构建（约 2-3 分钟）
        echo 然后访问前端地址进行测试
    )
)

echo.
echo ========================================
pause
