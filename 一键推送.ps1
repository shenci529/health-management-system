# ============================================================
# 一键推送脚本 - 使用 GitHub REST API 直接推送代码到 GitHub
# 解决问题：本地 git push 协议被阻断，但 GitHub API 可正常访问
# ============================================================

$ErrorActionPreference = 'Stop'
$repo = 'shenci529/health-management-system'
$branch = 'main'
$baseUrl = "https://api.github.com/repos/$repo"

Write-Host ""
Write-Host "=== 推送代码到 GitHub ===" -ForegroundColor Cyan
Write-Host ""

# ---------- 1. 检查是否已有 token ----------
$tokenFile = Join-Path $PSScriptRoot '.github-token.txt'
$token = $null

if (Test-Path $tokenFile) {
    $token = Get-Content $tokenFile -Raw | ForEach-Object { $_.Trim() }
    Write-Host "[1/4] 找到已有 token" -ForegroundColor Green
} else {
    Write-Host "[1/4] 需要 GitHub Personal Access Token"
    Write-Host ""
    Write-Host "请按以下步骤获取 token:" -ForegroundColor Yellow
    Write-Host "  1. 打开浏览器访问: https://github.com/settings/tokens"
    Write-Host "  2. 点击 'Generate new token' (Classic)"
    Write-Host "  3. 勾选 'repo' 权限"
    Write-Host "  4. 点击 'Generate token'"
    Write-Host "  5. 复制 token (以 ghp_ 开头) 并粘贴到这里"
    Write-Host ""
    $token = Read-Host "请粘贴你的 GitHub Token"
    
    if (-not $token -or $token.Length -lt 10) {
        Write-Host "Token 无效，退出" -ForegroundColor Red
        exit 1
    }
    
    $token | Set-Content $tokenFile
    Write-Host "Token 已保存" -ForegroundColor Green
}

$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/vnd.github.v3+json'
    'User-Agent' = 'PowerShell-GitPush'
}

# ---------- 2. 验证 token 并获取当前状态 ----------
Write-Host ""
Write-Host "[2/4] 验证 Token 并获取仓库状态..."
try {
    $ref = Invoke-RestMethod -Uri "$baseUrl/git/ref/heads/$branch" -Headers $headers -TimeoutSec 30
    $latestCommitSha = $ref.object.sha
    Write-Host "  当前 commit: $latestCommitSha"
    
    $commit = Invoke-RestMethod -Uri "$baseUrl/git/commits/$latestCommitSha" -Headers $headers -TimeoutSec 30
    $baseTreeSha = $commit.tree.sha
    Write-Host "  当前 tree: $baseTreeSha"
} catch {
    Write-Host "  Token 无效或没有权限: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $tokenFile -Force -ErrorAction SilentlyContinue
    exit 1
}

# ---------- 3. 创建文件 blobs ----------
Write-Host ""
Write-Host "[3/4] 上传文件内容到 GitHub..."
$filesToUpdate = @(
    @{ Path = 'server/licenseService.js'; Mode = '100644' },
    @{ Path = 'src/licenseService.js'; Mode = '100644' },
    @{ Path = 'src/views/LicenseActivate.vue'; Mode = '100644' },
    @{ Path = '.gitignore'; Mode = '100644' }
)

$treeEntries = @()

foreach ($file in $filesToUpdate) {
    $filePath = Join-Path $PSScriptRoot $file.Path
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $base64 = [Convert]::ToBase64String($bytes)
        
        $body = @{
            content = $base64
            encoding = 'base64'
        } | ConvertTo-Json
        
        try {
            $blob = Invoke-RestMethod -Uri "$baseUrl/git/blobs" -Method Post -Headers $headers -Body $body -TimeoutSec 60
            $treeEntries += @{
                path = $file.Path
                mode = $file.Mode
                type = 'blob'
                sha = $blob.sha
            }
            Write-Host "  ✓ $($file.Path) ($($bytes.Length) bytes)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $($file.Path) 失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ! $($file.Path) 不存在" -ForegroundColor Yellow
    }
}

if ($treeEntries.Count -eq 0) {
    Write-Host "没有文件需要更新" -ForegroundColor Red
    exit 1
}

# ---------- 4. 创建 tree, commit, 更新 ref ----------
Write-Host ""
Write-Host "[4/4] 创建新的 commit 并更新分支..."

# 4a. 创建新 tree
$treeBody = @{
    base_tree = $baseTreeSha
    tree = $treeEntries
} | ConvertTo-Json -Depth 10

$newTree = Invoke-RestMethod -Uri "$baseUrl/git/trees" -Method Post -Headers $headers -Body $treeBody -TimeoutSec 30
Write-Host "  新 tree SHA: $($newTree.sha)"

# 4b. 创建新 commit
$commitBody = @{
    message = '实现授权验证：客户端本地校验授权码，无需网络即可激活'
    parents = @($latestCommitSha)
    tree = $newTree.sha
} | ConvertTo-Json

$newCommit = Invoke-RestMethod -Uri "$baseUrl/git/commits" -Method Post -Headers $headers -Body $commitBody -TimeoutSec 30
Write-Host "  新 commit SHA: $($newCommit.sha)"

# 4c. 更新分支引用
$refBody = @{
    sha = $newCommit.sha
    force = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/git/refs/heads/$branch" -Method Patch -Headers $headers -Body $refBody -TimeoutSec 30 | Out-Null
Write-Host "  分支 $branch 已更新" -ForegroundColor Green

# ---------- 完成 ----------
Write-Host ""
Write-Host "=== 推送成功！===" -ForegroundColor Green
Write-Host ""
Write-Host "查看提交: https://github.com/$repo/commits/$branch"
Write-Host ""
Write-Host "部署 GitHub Pages: https://github.com/$repo/actions"
Write-Host ""

