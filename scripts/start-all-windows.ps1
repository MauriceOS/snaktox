# Start all SnaKTox services on Windows
# Usage: .\scripts\start-all-windows.ps1

Write-Host "🚀 Starting SnaKTox services..." -ForegroundColor Cyan
Write-Host ""

# Check if services are already running
$ports = @(3001, 3002, 8000)
$running = $false

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "⚠️  Port $port is already in use!" -ForegroundColor Yellow
        $running = $true
    }
}

if ($running) {
    Write-Host ""
    $response = Read-Host "Kill existing processes and start fresh? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        .\scripts\kill-all-windows.ps1
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Exiting. Please stop existing services first." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Starting services in separate windows..." -ForegroundColor Green
Write-Host ""

# Start Web App
Write-Host "🌐 Starting Web App (port 3001)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:web"

Start-Sleep -Seconds 2

# Start Backend
Write-Host "🔧 Starting Backend API (port 3002)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:backend"

Start-Sleep -Seconds 2

# Start AI Service
Write-Host "🤖 Starting AI Service (port 8000)..." -ForegroundColor Blue
$aiServicePath = Join-Path $PWD "services\ai-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aiServicePath'; python main.py"

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  🌐 Web App: http://localhost:3001" -ForegroundColor White
Write-Host "  🔧 Backend API: http://localhost:3002/api/docs" -ForegroundColor White
Write-Host "  🤖 AI Service: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Yellow


