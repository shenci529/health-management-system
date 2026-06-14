# ========================================
# 幼儿中小学生健康管理系统 - 云端部署配置脚本
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  幼儿中小学生健康管理系统 - 部署配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($projectRoot -ne (Get-Location).Path) {
    Set-Location $projectRoot
}

# 检查 Git 状态
Write-Host "[1/4] 检查 Git 状态..." -ForegroundColor Yellow
git status | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 不是 Git 仓库" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git 仓库正常" -ForegroundColor Green

# 检查代码是否已推送
Write-Host ""
Write-Host "[2/4] 检查代码推送状态..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin
if ($remoteUrl -notmatch "github.com") {
    Write-Host "错误: 未配置 GitHub 远程仓库" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 远程仓库: $remoteUrl" -ForegroundColor Green

# 提示用户输入 Render 后端 URL
Write-Host ""
Write-Host "[3/4] 配置后端 API 地址..." -ForegroundColor Yellow
Write-Host ""
Write-Host "请在浏览器中访问 https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "查看后端服务状态，获取后端 URL（例如：https://health-management-backend.onrender.com）" -ForegroundColor Cyan
Write-Host ""

$backendUrl = Read-Host "请输入 Render 后端 URL（包含 https://）"
if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "错误: 后端 URL 不能为空" -ForegroundColor Red
    exit 1
}

# 移除末尾的斜杠
$backendUrl = $backendUrl.TrimEnd('/')

Write-Host ""
Write-Host "后端 API 地址: $backendUrl" -ForegroundColor Green

# 创建配置脚本
Write-Host ""
Write-Host "[4/4] 生成部署配置..." -ForegroundColor Yellow

# 创建环境变量配置
$envExample = @"
# 环境变量配置
VITE_API_BASE=$backendUrl
"@

$envExample | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✓ 已创建 .env.production 配置文件" -ForegroundColor Green

# 提示下一步操作
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 打开浏览器访问: https://github.com/shenci529/health-management-system/settings/variables/actions" -ForegroundColor Cyan
Write-Host "2. 点击 'New repository variable'" -ForegroundColor Cyan
Write-Host "3. Name 填: BACKEND_API_URL" -ForegroundColor Cyan
Write-Host "4. Value 填: $backendUrl" -ForegroundColor Cyan
Write-Host "5. 点击 'Add variable'" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. 推送代码触发前端重新构建：" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m '配置后端API地址'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "7. 等待 3-5 分钟后，访问前端地址测试" -ForegroundColor Yellow
Write-Host ""

# 询问是否立即推送
Write-Host ""
$confirm = Read-Host "是否立即推送代码？(y/n)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "正在推送代码..." -ForegroundColor Yellow
    git add .
    git commit -m "配置后端API地址"
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 代码推送成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "请等待 GitHub Actions 完成前端构建（约 2-3 分钟）" -ForegroundColor Cyan
        Write-Host "然后访问前端地址进行测试" -ForegroundColor Cyan
    } else {
        Write-Host "✗ 代码推送失败，请检查网络连接" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
