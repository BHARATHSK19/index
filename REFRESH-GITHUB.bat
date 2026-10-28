@echo off
title Refresh GitHub contributors
cd /d "%~dp0"
if exist "BHARATHSK19)" del "BHARATHSK19)"
findstr /x /c:"FIX-GIT-AUTHOR.bat" .gitignore >nul 2>nul
if errorlevel 1 echo FIX-GIT-AUTHOR.bat>>.gitignore
git add -A
git commit -m "Ignore local helper script"
git push origin main
echo.
echo Pushed. GitHub will recount contributors shortly.
pause
