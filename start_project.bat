@echo off
title RescueLink Launcher
echo ==========================================
echo   🌍 Starting RescueLink Platform...
echo ==========================================

echo.
echo [1/2] Launching Backend Server (Port 5000)...
start "RescueLink Server" cmd /k "cd server && npm run dev"

echo.
echo [2/2] Launching Frontend Client (Port 5173)...
start "RescueLink Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ System starting up! Client will open in your browser shortly.
echo.
pause
