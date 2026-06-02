@echo off
echo ====================================
echo 部署到 GitHub Pages
echo ====================================
echo.

echo [1/5] 检查 dist 目录...
if not exist "dist" (
    echo 错误: dist 目录不存在！请先运行 npm run build
    pause
    exit /b 1
)

echo [2/5] 创建临时部署目录...
if exist ".deploy-temp" rd /s /q ".deploy-temp"
mkdir ".deploy-temp"

echo [3/5] 复制文件到部署目录...
xcopy /E /I /Y "dist" ".deploy-temp"

echo [4/5] 创建 .nojekyll 文件...
type nul > ".deploy-temp\.nojekyll"

echo [5/5] 准备完成！
echo.
echo ====================================
echo 部署步骤:
echo ====================================
echo.
echo 1. 在 GitHub 仓库中创建 gh-pages 分支
echo 2. 将 .deploy-temp 目录下的所有文件上传到 gh-pages 分支
echo 3. 在仓库 Settings - Pages 中设置 Source 为 gh-pages 分支
echo.
echo 或者手动将 dist 目录内容上传到 gh-pages 分支
echo.
echo 部署目录位置: %CD%\.deploy-temp
echo.
pause
