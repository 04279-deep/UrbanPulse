# ==============================================================================
# UrbanPulse - Launch All Services (PowerShell)
# ==============================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " [UrbanPulse] Launching Smart Urban Infrastructure Monitoring Services..." -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Start Backend in new window
Write-Host "[1/3] Starting Backend API (Node.js & Express on port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; node server.js"

# 2. Start Python AI in new window
Write-Host "[2/3] Starting Python AI Service (YOLOv8 & OpenCV on port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\python-ai'; & '.\venv\Scripts\uvicorn.exe' main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Frontend in new window
Write-Host "[3/3] Starting Frontend Web App (Vite React on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev"

Write-Host ""
Write-Host "All 3 services launched successfully!" -ForegroundColor Green
Write-Host " - Web App:            http://localhost:5173" -ForegroundColor White
Write-Host " - Live GIS Map:       http://localhost:5173/map" -ForegroundColor White
Write-Host " - AI Camera Monitor:  http://localhost:5173/camera-monitor" -ForegroundColor White
Write-Host " - API Settings:       http://localhost:5173/settings" -ForegroundColor White
Write-Host " - Backend API:        http://localhost:5000" -ForegroundColor White
Write-Host " - Python AI Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
