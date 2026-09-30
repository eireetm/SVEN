@echo off
title Shadowverse: Evolve NEXT {{version}}
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Please install Node.js 20 or newer ^(24 LTS recommended^): https://nodejs.org/
  echo China mirror: https://npmmirror.com/mirrors/node/
  echo.
  pause
  exit /b 1
)
node server.mjs
echo.
pause
