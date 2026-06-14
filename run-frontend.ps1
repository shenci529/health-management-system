$port = 3001
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()
Write-Host "前端静态服务已启动: http://localhost:$port/"
$distPath = "c:\Users\13194652066\Desktop\幼儿中小学生健康管理系统\dist"
$mimeMap = @{
    ".html"="text/html; charset=utf-8"; ".htm"="text/html; charset=utf-8"
    ".js"="application/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8"
    ".json"="application/json; charset=utf-8"; ".png"="image/png"; ".jpg"="image/jpeg"
    ".jpeg"="image/jpeg"; ".gif"="image/gif"; ".svg"="image/svg+xml"
    ".ico"="image/x-icon"; ".woff"="font/woff"; ".ttf"="font/ttf"
    ".map"="application/json; charset=utf-8"; ".txt"="text/plain; charset=utf-8"
}
while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $resp = $ctx.Response
        $path = $req.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        $filePath = Join-Path $distPath $path.TrimStart("/")
        if (-not (Test-Path $filePath) -and $path -notmatch "\.[a-zA-Z0-9]+$") {
            $filePath = Join-Path $distPath "index.html"
        }
        if (Test-Path $filePath) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $resp.ContentType = $mimeMap[$ext]
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentLength64 = $bytes.Length
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $resp.StatusCode = 404
        }
        $resp.Close()
    } catch {
        # 保持循环，避免单请求错误导致整个服务退出
    }
}
