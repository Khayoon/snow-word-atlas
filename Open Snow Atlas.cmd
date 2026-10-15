@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo This atlas needs Node.js to start its local web server.
  echo Install Node.js from https://nodejs.org and open this launcher again.
  pause
  exit /b 1
)
node local-server.mjs
if errorlevel 1 pause
