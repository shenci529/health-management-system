$ErrorActionPreference = "Stop"

$owner = "shenci529"
$repo = "health-management-system"
$branch = "main"
$token = $args[0]

if (-not $token) {
    Write-Host "用法: .\push.ps1 <your-github-token>"
    Write-Host ""
    Write-Host "创建 Token 步骤:"
    Write-Host "1. 访问 https://github.com/settings/tokens"
    Write-Host "2. 点击 Generate new token"
    Write-Host "3. 勾选 repo 权限"
    Write-Host "4. 点击 Generate token"
    Write-Host "5. 复制生成的 token (以 ghp_ 开头)"
    exit 1
}

$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$token:x-oauth-basic"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "HealthSystem"
    "Content-Type" = "application/json"
}

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoDir

$files = @(
    @{ path = ".gitignore"; local = ".gitignore" },
    @{ path = "server/licenseService.js"; local = "server\licenseService.js" },
    @{ path = "src/licenseService.js"; local = "src\licenseService.js" },
    @{ path = "src/views/LicenseActivate.vue"; local = "src\views\LicenseActivate.vue" }
)

Write-Host "============================================"
Write-Host "GitHub API 代码推送工具"
Write-Host "============================================"
Write-Host ""

Write-Host "[1/5] 验证文件..."
foreach ($f in $files) {
    $exists = Test-Path $f.local
    if (-not $exists) {
        Write-Host "  ✗ 找不到: $($f.local)"
        exit 1
    }
    Write-Host "  ✓ $($f.path)"
}
Write-Host ""

Write-Host "[2/5] 获取最新 commit..."
$refUrl = "https://api.github.com/repos/$owner/$repo/git/ref/heads/$branch"
$ref = Invoke-RestMethod -Uri $refUrl -Method Get -Headers $headers
$latestCommitSha = $ref.object.sha
Write-Host "  SHA: $latestCommitSha"
Write-Host ""

Write-Host "[3/5] 获取当前 tree..."
$commitUrl = "https://api.github.com/repos/$owner/$repo/git/commits/$latestCommitSha"
$commit = Invoke-RestMethod -Uri $commitUrl -Method Get -Headers $headers
$baseTreeSha = $commit.tree.sha
Write-Host "  Tree SHA: $baseTreeSha"
Write-Host ""

Write-Host "[4/5] 创建文件 blobs..."
$treeItems = @()
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllBytes($f.local)
    $base64 = [Convert]::ToBase64String($content)
    $body = @{ content = $base64; encoding = "base64" } | ConvertTo-Json
    $blobUrl = "https://api.github.com/repos/$owner/$repo/git/blobs"
    $blob = Invoke-RestMethod -Uri $blobUrl -Method Post -Headers $headers -Body $body
    Write-Host "  ✓ $($f.path) -> $($blob.sha.Substring(0,8))..."
    $treeItems += @{ path = $f.path; mode = "100644"; type = "blob"; sha = $blob.sha }
}
Write-Host ""

Write-Host "[5/5] 创建新 tree 和 commit..."
$treeBody = @{ base_tree = $baseTreeSha; tree = $treeItems } | ConvertTo-Json -Depth 3
$treeUrl = "https://api.github.com/repos/$owner/$repo/git/trees"
$newTree = Invoke-RestMethod -Uri $treeUrl -Method Post -Headers $headers -Body $treeBody
Write-Host "  新 Tree SHA: $($newTree.sha)"

$commitMessage = "实现授权验证：客户端本地校验授权码，无需网络即可激活"
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$commitBody = @{
    message = $commitMessage
    parents = @($latestCommitSha)
    tree = $newTree.sha
    author = @{ name = "HealthSystem"; email = "health@example.com"; date = $now }
} | ConvertTo-Json -Depth 3
$commitUrl2 = "https://api.github.com/repos/$owner/$repo/git/commits"
$newCommit = Invoke-RestMethod -Uri $commitUrl2 -Method Post -Headers $headers -Body $commitBody
Write-Host "  新 Commit SHA: $($newCommit.sha)"

Write-Host ""
Write-Host "更新分支引用..."
$refBody = @{ sha = $newCommit.sha; force = $false } | ConvertTo-Json
$refUpdateUrl = "https://api.github.com/repos/$owner/$repo/git/refs/heads/$branch"
$refUpdate = Invoke-RestMethod -Uri $refUpdateUrl -Method Patch -Headers $headers -Body $refBody
Write-Host "  ✓ 分支已更新"

Write-Host ""
Write-Host "============================================"
Write-Host "🎉 推送成功！"
Write-Host "============================================"
Write-Host "新 Commit: $($newCommit.sha)"
Write-Host "查看仓库: https://github.com/$owner/$repo"
Write-Host ""
