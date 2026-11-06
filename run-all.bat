@echo off
title UrbanPulse - Smart Urban Infrastructure Monitoring System
echo ==============================================================================
echo [UrbanPulse] Launching All 3 Microservices in Separate Terminals...
echo ==============================================================================

cd /d "%~dp0"

echo [1/3] Starting Backend API (Node.js & Express on http://localhost:5000)...
start "UrbanPulse Backend" cmd /k "cd backend && npm start"

echo [2/3] Starting Python AI Microservice (FastAPI on http://127.0.0.1:8000)...
start "UrbanPulse Python AI" cmd /k "cd python-ai && .\venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Frontend Web App (Vite React on http://localhost:5173)...
start "UrbanPulse Frontend" cmd /k "cd frontend && npm run dev"

echo ==============================================================================
echo UrbanPulse is starting up!
echo   - Frontend:         http://localhost:5173
echo   - Andhra Pradesh GIS Map: http://localhost:5173/map
echo   - AI Camera Monitor:     http://localhost:5173/camera-monitor
echo   - Settings & API Keys:   http://localhost:5173/settings
echo   - Backend Server:        http://localhost:5000
echo   - Python AI Docs:        http://127.0.0.1:8000/docs
echo ==============================================================================
pause
