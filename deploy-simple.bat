@echo off
echo ====================================
echo GitHub Pages 简单部署脚本
echo ====================================
echo.

echo [步骤 1: 检查 dist 目录...
if not exist "dist" (
    echo 错误: dist 目录不存在！请先运行 npm run build
    pause
    exit /b 1
)

echo [步骤 2: 删除旧的 gh-pages 分支（如果存在）...
git branch -D gh-pages 2>nul
git push origin --delete gh-pages 2>nul

echo [步骤 3: 创建新的 gh-pages 分支...
git checkout --orphan gh-pages

echo [步骤 4: 清理文件...
git rm -rf .

echo [步骤 5: 复制 dist 内容...
xcopy /E /I /Y dist .

echo [步骤 6: 创建 .nojekyll 文件...
type nul > .nojekyll

echo [步骤 7: 添加文件到 git...
git add .

echo [步骤 8: 提交...
git commit -m "Deploy to GitHub Pages"

echo.
echo ====================================
echo 部署准备完成！
echo ====================================
echo.
echo 现在运行: git push origin gh-pages
echo.
echo 然后在 GitHub Settings - Pages 中选择 gh-pages 分支
echo.
pause
