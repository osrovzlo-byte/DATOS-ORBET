param(
    [int]$Port = 8080,
    [switch]$OpenBrowser = $false
)

$directory = $PSScriptRoot
$listener = New-Object System.Net.HttpListener

$localIPs = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.' }).IPAddress

try {
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    if ($localIPs) {
        foreach ($ip in $localIPs) {
            try { $listener.Prefixes.Add("http://${ip}:$Port/") } catch {}
        }
    }
    $listener.Start()
} catch {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DATOS ORBET - LA APP DE LA SUERTE" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor activo en su computadora:" -ForegroundColor Green
Write-Host "  -> http://localhost:$Port/" -ForegroundColor White
Write-Host ""
if ($localIPs) {
    Write-Host "Para abrirlo e instalarlo en su teléfono Android (misma red WiFi):" -ForegroundColor Green
    foreach ($ip in $localIPs) {
        Write-Host "  -> http://$ip`:$Port/" -ForegroundColor Yellow
    }
    Write-Host ""
}
Write-Host "Endpoint Proxy CORS Local activo:" -ForegroundColor Magenta
Write-Host "  -> http://localhost:$Port/api/proxy?url=..." -ForegroundColor White
Write-Host ""
Write-Host "Presione Ctrl + C en esta ventana para detener el servidor." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

if ($OpenBrowser) {
    Start-Process "http://localhost:$Port/"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Soporte para endpoint Proxy CORS local
        if ($request.Url.LocalPath -eq "/api/proxy") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "*")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 204
                $response.OutputStream.Close()
                continue
            }

            $targetUrl = $request.QueryString["url"]
            if (![string]::IsNullOrWhiteSpace($targetUrl)) {
                try {
                    $webClient = New-Object System.Net.WebClient
                    $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    $webClient.Encoding = [System.Text.Encoding]::UTF8
                    $htmlData = $webClient.DownloadString($targetUrl)
                    $response.ContentType = "text/html; charset=utf-8"
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($htmlData)
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } catch {
                    $response.StatusCode = 502
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes("Error proxying request: " + $_.Exception.Message)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 400
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("Parámetro 'url' requerido")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.OutputStream.Close()
            continue
        }

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        $path = $path.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path $directory $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Handle client disconnect gracefully
    }
}
