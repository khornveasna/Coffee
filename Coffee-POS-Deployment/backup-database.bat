@echo off
REM Coffee POS System - Database Backup Script
echo ========================================
echo Coffee POS Database Backup
echo ========================================
echo.

cd /d "%~dp0"
node scripts\backup-database.js

echo.
pause
