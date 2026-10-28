@echo off
title OJIX website (Build 04)
cd /d "%~dp0"
echo.
echo  OJIX website - starting...
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
echo  [1/3] Installing packages (first run takes a minute)...
call npm install --no-audit --no-fund
if errorlevel 1 ( echo  npm install failed. & pause & exit /b 1 )
echo  [2/3] Building the site...
call npm run build
if errorlevel 1 ( echo  Build failed. & pause & exit /b 1 )
echo  [3/3] Starting server on http://localhost:3000  (close this window to stop it)
set NODE_ENV=development
set PORT=3000
start "" http://localhost:3000
node server.js
pause
