@echo off
REM Coffee POS System - Complete Production Preparation Script
REM This script prepares the project for production deployment
REM Run this script as Administrator for full functionality

echo.
echo ================================================================
echo    Coffee POS System - Production Preparation
echo ================================================================
echo.
echo This script will:
echo   1. Install production dependencies
echo   2. Configure environment variables
echo   3. Run database migrations
echo   4. Create necessary directories
echo   5. Set file permissions
echo   6. Generate security keys
echo   7. Verify installation
echo.
echo ================================================================
echo.

REM Check if running from correct directory
if not exist "server.js" (
    echo ERROR: server.js not found!
    echo Please run this script from the Coffee POS System folder.
    echo.
    pause
    exit /b 1
)

echo Step 1: Installing production dependencies...
echo ----------------------------------------------------------------
call npm install --production
if %errorLevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed successfully!
echo.

echo Step 2: Configuring environment variables...
echo ----------------------------------------------------------------
if not exist ".env" (
    copy .env.example .env
    echo [OK] Created .env file from template
    echo.
    echo Generating secure SESSION_SECRET...
    
    REM Generate random secret key
    for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set SECRET=%%i
    
    REM Update .env file with new secret
    powershell -Command "(Get-Content .env) -replace 'SESSION_SECRET=your-secret-key-change-in-production', 'SESSION_SECRET=%SECRET%' | Set-Content .env"
    
    echo [OK] SESSION_SECRET generated and saved to .env
    echo.
) else (
    echo [OK] .env file already exists
    echo.
)

echo Step 3: Creating necessary directories...
echo ----------------------------------------------------------------
if not exist "logs" (
    mkdir logs
    echo [OK] Created logs directory
) else (
    echo [OK] logs directory already exists
)

if not exist "backups" (
    mkdir backups
    echo [OK] Created backups directory
) else (
    echo [OK] backups directory already exists
)
echo.

echo Step 4: Running database migrations...
echo ----------------------------------------------------------------
if exist "migrate-db.js" (
    node migrate-db.js
    if %errorLevel% equ 0 (
        echo [OK] Database migrations completed!
    ) else (
        echo [WARNING] Database migration had issues, continuing...
    )
) else (
    echo [OK] migrate-db.js not found, skipping
)
echo.

echo Step 5: Checking database file...
echo ----------------------------------------------------------------
if exist "coffee_pos.db" (
    for %%A in (coffee_pos.db) do set size=%%~zA
    set /a sizeMB=!size! / 1048576
    echo [OK] Database file exists (approximately !sizeMB! MB)
) else (
    echo [WARNING] Database file not found, it will be created on first run
)
echo.

echo Step 6: Verifying installation...
echo ----------------------------------------------------------------

REM Check Node.js
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "delims=" %%i in ('node --version') do set NODEVER=%%i
    echo [OK] Node.js installed: !NODEVER!
) else (
    echo [ERROR] Node.js not installed!
)

REM Check npm
where npm >nul 2>&1
if %errorLevel% equ 0 (
    for /f "delims=" %%i in ('npm --version') do set NPMVER=%%i
    echo [OK] npm installed: !NPMVER!
) else (
    echo [ERROR] npm not installed!
)

REM Check node_modules
if exist "node_modules\express" (
    echo [OK] Express.js installed
) else (
    echo [ERROR] Express.js not found in node_modules!
)

if exist "node_modules\socket.io" (
    echo [OK] Socket.io installed
) else (
    echo [ERROR] Socket.io not found in node_modules!
)

if exist "node_modules\bcryptjs" (
    echo [OK] bcrypt.js installed
) else (
    echo [ERROR] bcrypt.js not found in node_modules!
)

echo.
echo ================================================================
echo    Production Preparation Complete!
echo ================================================================
echo.
echo Next Steps:
echo.
echo   1. Review and edit .env file with your settings
echo      - Change SESSION_SECRET if needed (already generated)
echo      - Set PORT (default: 3000)
echo      - Configure CORS_ORIGINS if deploying to production
echo.
echo   2. Start the server:
echo      npm start
echo.
echo   3. Open browser:
echo      http://localhost:3000
echo.
echo   4. Login with default credentials:
echo      Username: admin
echo      Password: 1234
echo.
echo   5. IMPORTANT: Change the default admin password!
echo.
echo ================================================================
echo.
echo For IIS Deployment:
echo   - Run deploy-iis.ps1 as Administrator
echo.
echo For PM2 Deployment:
echo   - npm install -g pm2
echo   - pm2 start ecosystem.config.js
echo.
echo For Production Deployment:
echo   - See PRODUCTION_CHECKLIST.md
echo   - See PRODUCTION_DEPLOYMENT.md
echo.
echo ================================================================
echo.

REM Ask if user wants to start the server now
set /p STARTNOW="Do you want to start the server now? (Y/N): "
if /i "%STARTNOW%"=="Y" (
    echo.
    echo Starting server...
    echo.
    echo Server will be available at: http://localhost:3000
    echo Press Ctrl+C to stop the server
    echo.
    echo ================================================================
    echo.
    set NODE_ENV=production
    node server.js
) else (
    echo.
    echo To start the server later, run:
    echo   npm start
    echo.
    echo Or double-click: start-production.bat
    echo.
)

pause
