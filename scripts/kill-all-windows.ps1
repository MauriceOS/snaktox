# Kill all SnaKTox services on Windows
# Usage: .\scripts\kill-all-windows.ps1

Write-Host "🛑 Stopping SnaKTox services..." -ForegroundColor Yellow

$ports = @(3001, 3002, 8000)
$killed = 0

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pid = $conn.OwningProcess
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Killing process on port $port (PID: $pid, Name: $($process.ProcessName))" -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                $killed++
            }
        }
    } else {
        Write-Host "Port $port is free" -ForegroundColor Green
    }
}

if ($killed -gt 0) {
    Write-Host "✅ Stopped $killed process(es)" -ForegroundColor Green
} else {
    Write-Host "✅ No processes found on ports 3001, 3002, 8000" -ForegroundColor Green
}


