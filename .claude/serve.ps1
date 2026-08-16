param(
    [string]$Root = "D:\TESTING_GAMING\METROPOLIS\METROPOLIS",
    [int]$Port = 4173
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "serving $Root on http://localhost:$Port/"

$types = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".md"   = "text/plain; charset=utf-8"
    ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $path = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
        if ($path -eq "/") { $path = "/index.html" }
        $full = Join-Path $Root ($path.TrimStart("/") -replace "/", "\")

        if (Test-Path $full -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $type = $types[$ext]
            if (-not $type) { $type = "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($full)
            $context.Response.ContentType = $type
            $context.Response.Headers.Add("Cache-Control", "no-store")
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("not found: $path")
            $context.Response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $context.Response.Close()
    } catch {
        Write-Output "error: $_"
    }
}
