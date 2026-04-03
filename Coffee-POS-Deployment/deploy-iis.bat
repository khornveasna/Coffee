@echo off
REM Coffee POS System - Quick IIS Deployment Script
REM Run this script as Administrator

echo ========================================
echo Coffee POS System - IIS Deployment
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click the script and select "Run as administrator"
    pause
    exit /b 1
)

echo Step 1: Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)

echo   Node.js version: 
node --version
echo.

REM Check if IISNode exists
if not exist "%ProgramFiles%\iisnode" (
    if not exist "%ProgramFiles(x86)%\iisnode" (
        echo ERROR: IISNode is not installed!
        echo Please download from: https://github.com/Azure/iisnode/releases
        pause
        exit /b 1
    )
)

echo   IISNode is installed
echo.

echo Step 2: Installing npm dependencies...
echo.

REM Install npm packages
call npm install --production
if %errorLevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo   npm packages installed!
echo.

echo Step 3: Setting folder permissions...
echo.

REM Set permissions for IIS_IUSRS
icacls "%~dp0" /grant "IIS_IUSRS:(OI)(CI)F" /T
echo   Permissions set!
echo.

echo Step 4: Creating IIS Application Pool and Website...
echo.

REM Import IIS module and create app pool and site using PowerShell
powershell -Command "Import-Module WebAdministration; if (Test-Path 'IIS:\AppPools\CoffeePOS_Pool') { Remove-WebAppPool -Name 'CoffeePOS_Pool' }; New-WebAppPool -Name 'CoffeePOS_Pool'; Set-ItemProperty 'IIS:\AppPools\CoffeePOS_Pool' -Name 'managedRuntimeVersion' -Value ''; Set-ItemProperty 'IIS:\AppPools\CoffeePOS_Pool' -Name 'startMode' -Value 'AlwaysRunning'"

powershell -Command "Import-Module WebAdministration; if (Test-Path 'IIS:\Sites\Coffee POS System') { Remove-Website -Name 'Coffee POS System' }; New-Website -Name 'Coffee POS System' -ApplicationPool 'CoffeePOS_Pool' -PhysicalPath '%~dp0' -Port 80 -Force"

echo   IIS configured!
echo.

echo Step 5: Adding firewall rule...
echo.

netsh advfirewall firewall add rule name="Coffee POS HTTP" dir=in action=allow protocol=TCP localport=80

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your Coffee POS System is now available at:
echo   http://localhost
echo.
echo Default login:
echo   Username: admin
echo   Password: 1234
echo.
echo To manage your site:
echo   1. Open IIS Manager (run: inetmgr)
echo   2. Find 'Coffee POS System' under Sites
echo.
pause
