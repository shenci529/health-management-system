@echo off
chcp 65001 > nul
echo ========================================
echo   幼儿中小学生健康管理系统
echo   全自动云端部署配置工具
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 检查 Git 状态...
git status > nul 2>&1
if errorlevel 1 (
    echo 错误: 不是 Git 仓库
    pause
    exit /b 1
)
echo ✓ Git 仓库正常
echo.

echo [2/5] 检查代码推送状态...
git remote -v | findstr "github.com" > nul
if errorlevel 1 (
    echo 错误: 未配置 GitHub 远程仓库
    pause
    exit /b 1
)
for /f "tokens=2" %%a in ('git remote get-url origin') do set "REPO_URL=%%a"
echo ✓ 远程仓库: %REPO_URL%
echo.

echo [3/5] 尝试检测 Render 后端服务...
echo.

REM 尝试访问常见的 Render 后端 URL
set BACKEND_URL=
curl -s -o nul -w "%%{http_code}" "https://health-management-backend.onrender.com/" > temp_status.txt 2>&1
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    set BACKEND_URL=https://health-management-backend.onrender.com
    echo ✓ 检测到后端服务: %BACKEND_URL%
) else (
    echo ✗ 未检测到后端服务
    echo.
    echo 请访问 https://dashboard.render.com 查看后端部署状态
    echo 或者手动输入后端 URL
    echo.
    set /p BACKEND_URL="请输入 Render 后端 URL（包含 https://）: "
)

if "%BACKEND_URL%"=="" (
    echo 错误: 后端 URL 不能为空
    pause
    exit /b 1
)

REM 移除末尾的斜杠
if "%BACKEND_URL:~-1%"=="/" set "BACKEND_URL=%BACKEND_URL:~0,-1%"

echo.
echo 后端 API 地址: %BACKEND_URL%
echo.

echo [4/5] 生成部署配置...
echo VITE_API_BASE=%BACKEND_URL% > ".env.production"
echo ✓ 已创建 .env.production 配置文件
echo.

echo [5/5] 检查 GitHub 变量配置...
echo.

REM 提取 GitHub 用户名和仓库名
for /f "tokens=2 delims=/" %%a in ('echo %REPO_URL%') do set "GITHUB_USER=%%a"
for /f "tokens=3 delims=/" %%a in ('echo %REPO_URL%') do set "GITHUB_REPO=%%a"
set "GITHUB_REPO=%GITHUB_REPO:.git=%"

echo GitHub 用户: %GITHUB_USER%
echo GitHub 仓库: %GITHUB_REPO%
echo.

echo 请在浏览器中完成以下操作：
echo.
echo ========================================
echo   重要：配置 GitHub 变量
echo ========================================
echo.
echo 1. 打开以下链接：
echo    https://github.com/%GITHUB_USER%/%GITHUB_REPO%/settings/variables/actions
echo.
echo 2. 点击 "New repository variable" 按钮
echo.
echo 3. 填写信息：
echo    - Name: BACKEND_API_URL
echo    - Value: %BACKEND_URL%
echo.
echo 4. 点击 "Add variable" 保存
echo.
echo 5. 推送代码触发前端重新构建：
echo    git add .
echo    git commit -m "配置后端API地址"
echo    git push
echo.
echo 6. 等待 3-5 分钟后访问前端地址测试
echo.

echo ========================================
echo   即将打开 GitHub 设置页面...
echo ========================================
echo.

set /p confirm="按 Enter 键打开浏览器（或输入 n 跳过）: "
if not "%confirm%"=="n" if not "%confirm%"=="N" (
    start "https://github.com/%GITHUB_USER%/%GITHUB_REPO%/settings/variables/actions"
)

echo.
echo ========================================
echo   操作完成！
echo ========================================
echo.
echo 提示：
echo - Render 会自动检测代码变更并部署后端（约 2-3 分钟）
echo - GitHub Actions 会自动构建前端并部署到 GitHub Pages（约 2-3 分钟）
echo - 部署完成后访问前端地址测试手机端访问
echo.

pause
