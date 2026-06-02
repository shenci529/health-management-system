# 健康管理系统启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  健康管理系统 - 安装和启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# 设置环境变量以包含Node.js路径
$env:Path = "C:\Program Files\nodejs;$env:Path"

Write-Host "[1/4] 检查Node.js安装..." -ForegroundColor Yellow
try {
    $nodeVersion = & "C:\Program Files\nodejs\node.exe" --version
    Write-Host "  Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  错误: 无法找到Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] 检查npm安装..." -ForegroundColor Yellow
try {
    $npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version
    Write-Host "  npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  错误: 无法找到npm" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] 安装项目依赖..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  依赖安装成功!" -ForegroundColor Green
} else {
    Write-Host "  警告: 依赖安装遇到问题" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  请访问: http://localhost:3000" -ForegroundColor Green
Write-Host "  按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" run dev
