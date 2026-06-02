# 设置Node.js路径
$env:Path = "C:\Program Files\nodejs;$env:Path"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  健康管理系统 - 开发服务器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] 安装依赖..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" install

Write-Host ""
Write-Host "[2/2] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  本地访问地址: http://localhost:3000" -ForegroundColor Green
Write-Host "  按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" run dev