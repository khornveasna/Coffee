@echo off
REM Coffee POS System - Create Deployment Package
REM This script creates a clean deployment folder with all necessary files

echo.
echo ================================================================
echo    Coffee POS System - Creating Deployment Package
echo ================================================================
echo.

REM Set deployment folder name
set DEPLOY_FOLDER=Coffee-POS-Deployment

REM Check if deployment folder exists, if yes delete it
if exist "%DEPLOY_FOLDER%" (
    echo Removing old deployment folder...
    rmdir /s /q "%DEPLOY_FOLDER%"
)

echo Creating deployment folder: %DEPLOY_FOLDER%
echo.
mkdir "%DEPLOY_FOLDER%"

echo Copying application files...
echo ----------------------------------------------------------------

REM Copy main application files
copy "index.html" "%DEPLOY_FOLDER%\" >nul
copy "app.js" "%DEPLOY_FOLDER%\" >nul
copy "data.js" "%DEPLOY_FOLDER%\" >nul
copy "styles.css" "%DEPLOY_FOLDER%\" >nul
copy "server.js" "%DEPLOY_FOLDER%\" >nul
copy "server-production.js" "%DEPLOY_FOLDER%\" >nul
copy "config.js" "%DEPLOY_FOLDER%\" >nul
copy "migrate-db.js" "%DEPLOY_FOLDER%\" >nul
copy "reset.html" "%DEPLOY_FOLDER%\" >nul
echo [OK] Application files copied

echo.
echo Copying configuration files...
echo ----------------------------------------------------------------
copy "package.json" "%DEPLOY_FOLDER%\" >nul
copy "package-lock.json" "%DEPLOY_FOLDER%\" >nul
copy "web.config" "%DEPLOY_FOLDER%\" >nul
copy "ecosystem.config.js" "%DEPLOY_FOLDER%\" >nul
copy ".env.example" "%DEPLOY_FOLDER%\" >nul
copy ".gitignore" "%DEPLOY_FOLDER%\" >nul
echo [OK] Configuration files copied

echo.
echo Copying deployment scripts...
echo ----------------------------------------------------------------
copy "prepare-for-production.bat" "%DEPLOY_FOLDER%\" >nul
copy "start-production.bat" "%DEPLOY_FOLDER%\" >nul
copy "deploy-iis.ps1" "%DEPLOY_FOLDER%\" >nul
copy "deploy-iis.bat" "%DEPLOY_FOLDER%\" >nul
copy "backup-database.bat" "%DEPLOY_FOLDER%\" >nul
echo [OK] Deployment scripts copied

echo.
echo Creating scripts folder...
echo ----------------------------------------------------------------
mkdir "%DEPLOY_FOLDER%\scripts"
copy "scripts\backup-database.js" "%DEPLOY_FOLDER%\scripts\" >nul
echo [OK] Scripts folder created

echo.
echo Copying database file...
echo ----------------------------------------------------------------
if exist "coffee_pos.db" (
    copy "coffee_pos.db" "%DEPLOY_FOLDER%\" >nul
    echo [OK] Database file copied
) else (
    echo [INFO] No database file found (will be created on first run)
)

echo.
echo Creating necessary directories...
echo ----------------------------------------------------------------
mkdir "%DEPLOY_FOLDER%\logs"
mkdir "%DEPLOY_FOLDER%\backups"
echo [OK] Directories created (logs, backups)

echo.
echo Copying documentation...
echo ----------------------------------------------------------------
copy "README.md" "%DEPLOY_FOLDER%\" >nul
copy "QUICK_START_GUIDE.md" "%DEPLOY_FOLDER%\" >nul
copy "PRODUCTION_READY_SUMMARY.md" "%DEPLOY_FOLDER%\" >nul
copy "PRODUCTION_CHECKLIST.md" "%DEPLOY_FOLDER%\" >nul
copy "PRODUCTION_DEPLOYMENT.md" "%DEPLOY_FOLDER%\" >nul
copy "IIS_DEPLOYMENT_GUIDE.md" "%DEPLOY_FOLDER%\" >nul
copy "IIS_QUICK_START.md" "%DEPLOY_FOLDER%\" >nul
copy "HOW_TO_RUN.md" "%DEPLOY_FOLDER%\" >nul
copy "QUICK_START.md" "%DEPLOY_FOLDER%\" >nul
copy "API_DOCUMENTATION.md" "%DEPLOY_FOLDER%\" >nul
copy "USER_PERMISSIONS_GUIDE.md" "%DEPLOY_FOLDER%\" >nul
copy "REST_API_INTEGRATION.md" "%DEPLOY_FOLDER%\" >nul
echo [OK] Documentation copied

echo.
echo ================================================================
echo    Deployment Package Created Successfully!
echo ================================================================
echo.
echo Location: %CD%\%DEPLOY_FOLDER%
echo.
echo This folder contains everything needed to deploy and run:
echo.
echo   Application Files:
echo     - index.html, app.js, styles.css (Frontend)
echo     - server.js, config.js (Backend)
echo     - coffee_pos.db (Database with sample data)
echo.
echo   Configuration:
echo     - package.json (Dependencies)
echo     - .env.example (Environment template)
echo     - web.config (IIS configuration)
echo     - ecosystem.config.js (PM2 configuration)
echo.
echo   Deployment Scripts:
echo     - prepare-for-production.bat (Complete setup)
echo     - start-production.bat (Quick start)
echo     - deploy-iis.ps1 (IIS deployment)
echo     - backup-database.bat (Database backup)
echo.
echo   Documentation:
echo     - README.md (Main documentation)
echo     - QUICK_START_GUIDE.md (5-minute start)
echo     - PRODUCTION_CHECKLIST.md (Deployment checklist)
echo     - And more...
echo.
echo ================================================================
echo.
echo Next Steps:
echo.
echo   1. Copy the '%DEPLOY_FOLDER%' folder to your target location
echo.
echo   2. Open the folder and run:
echo      prepare-for-production.bat
echo.
echo   3. After preparation, run:
echo      start-production.bat
echo.
echo   4. Open browser: http://localhost:3000
echo.
echo   5. Login: admin / 1234
echo.
echo ================================================================
echo.

REM Show folder size
powershell -Command "$folder = '.\%DEPLOY_FOLDER%'; $size = (Get-ChildItem -Recurse $folder | Measure-Object -Property Length -Sum).Sum; Write-Host ('Deployment package size: ' + [math]::Round($size/1048576, 2) + ' MB')"

echo.
echo Opening deployment folder...
explorer "%DEPLOY_FOLDER%"

pause
