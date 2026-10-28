@echo off
title Push OJIX to GitHub
cd /d "%~dp0"
set REPO=https://github.com/BHARATHSK19/ojix-version1.git
echo.
echo  Pushing this folder to %REPO%
echo  (node_modules, .env, the database and build output are left out by .gitignore)
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo  Git is not installed. Install it from https://git-scm.com/download/win and run this file again.
  pause & exit /b 1
)
if not exist .git git init
git config user.name >nul 2>nul || (
  set /p GNAME= Your name for commits: 
  call git config user.name "%%GNAME%%"
)
git config user.email >nul 2>nul || (
  set /p GMAIL= Your GitHub email: 
  call git config user.email "%%GMAIL%%"
)
git add -A
git commit -m "OJIX Build 04: React site, new products, clean URLs, fixes"
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin %REPO%
echo.
echo  Uploading... a GitHub sign-in window may open the first time.
git push -u origin main
if errorlevel 1 (
  echo.
  echo  Push failed. If GitHub says the repository already has files, tell Claude.
) else (
  echo.
  echo  Done: https://github.com/BHARATHSK19/ojix-version1
)
pause
