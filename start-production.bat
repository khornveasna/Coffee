@echo off
REM Coffee POS System - Production Startup Script
echo ========================================
echo Starting Coffee POS System
echo ========================================
echo.

REM Check if node_modules exists
if not exist "%~dp0node_modules" (
    echo First-time setup detected. Installing dependencies...
    echo.
    call npm install
    if %errorLevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

REM Check if .env exists
if not exist "%~dp0.env" (
    echo Creating .env file from template...
    copy "%~dp0.env.example" "%~dp0.env"
    echo.
    echo Please edit .env file to configure your environment.
    echo Using default settings for now...
    echo.
)

echo Starting server in production mode...
echo.
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"
set NODE_ENV=production
node server.js

pause
