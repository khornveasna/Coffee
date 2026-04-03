# Coffee POS System - IIS Deployment Script
# Run this script as Administrator

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Coffee POS System - IIS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Configuration
$siteName = "Coffee POS System"
$appPoolName = "CoffeePOS_Pool"
$deployPath = "C:\inetpub\wwwroot\CoffeePOS"
$port = 80

Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Green

# Check if IIS is installed
$iisInstalled = Get-WindowsOptionalFeature -Online -FeatureName "IIS-WebServerRole" -ErrorAction SilentlyContinue
if ($iisInstalled.State -ne "Enabled") {
    Write-Host "IIS is not installed. Installing IIS..." -ForegroundColor Yellow
    
    # Enable IIS with required features
    Enable-WindowsOptionalFeature -Online -FeatureName "IIS-WebServerRole" -All -NoRestart
    Enable-WindowsOptionalFeature -Online -FeatureName "IIS-WebSockets" -NoRestart
    
    Write-Host "IIS installed successfully!" -ForegroundColor Green
    Write-Host "Please restart your computer and run this script again." -ForegroundColor Yellow
    exit 0
}

# Check if Node.js is installed
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ Node.js version: $(node --version)" -ForegroundColor Green

# Check if IISNode is installed
$iisnodePath = Join-Path $env:ProgramFiles "iisnode"
if (-not (Test-Path $iisnodePath)) {
    $iisnodePath = Join-Path ${env:ProgramFiles(x86)} "iisnode"
}

if (-not (Test-Path $iisnodePath)) {
    Write-Host "ERROR: IISNode is not installed!" -ForegroundColor Red
    Write-Host "Please download and install IISNode from: https://github.com/Azure/iisnode/releases" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ IISNode is installed" -ForegroundColor Green

# Check if URL Rewrite is installed
$urlRewriteDll = Join-Path $env:SystemRoot "System32\inetsrv\rewrite.dll"
if (-not (Test-Path $urlRewriteDll)) {
    Write-Host "ERROR: URL Rewrite Module is not installed!" -ForegroundColor Red
    Write-Host "Please download and install from: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ URL Rewrite Module is installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Preparing deployment folder..." -ForegroundColor Green

# Get the current script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if source files exist
if (-not (Test-Path (Join-Path $scriptDir "server.js"))) {
    Write-Host "ERROR: Coffee POS files not found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from your Coffee POS System folder." -ForegroundColor Yellow
    exit 1
}

# Create deployment directory if it doesn't exist
if (-not (Test-Path $deployPath)) {
    New-Item -ItemType Directory -Path $deployPath -Force | Out-Null
    Write-Host "  ✓ Created deployment directory: $deployPath" -ForegroundColor Green
}

# Copy files to deployment directory
Write-Host "  Copying files to $deployPath..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $scriptDir "*") -Destination $deployPath -Recurse -Force -Exclude "deploy-iis.ps1"
Write-Host "  ✓ Files copied successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Installing npm dependencies..." -ForegroundColor Green

# Install npm packages
Set-Location $deployPath
npm install --production

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ npm packages installed!" -ForegroundColor Green
} else {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Setting folder permissions..." -ForegroundColor Green

# Grant IIS_IUSRS permissions
$acl = Get-Acl $deployPath
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl $deployPath $acl

# Also set permissions for the database file specifically
$dbPath = Join-Path $deployPath "coffee_pos.db"
if (Test-Path $dbPath) {
    $dbAcl = Get-Acl $dbPath
    $dbRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "Allow")
    $dbAcl.SetAccessRule($dbRule)
    Set-Acl $dbPath $dbAcl
}

Write-Host "  ✓ Permissions set for IIS_IUSRS!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Creating IIS Application Pool..." -ForegroundColor Green

# Import IIS module
Import-Module WebAdministration

# Remove existing app pool if it exists
if (Test-Path "IIS:\AppPools\$appPoolName") {
    Remove-WebAppPool -Name $appPoolName
    Write-Host "  ✓ Removed existing application pool" -ForegroundColor Yellow
}

# Create application pool
New-WebAppPool -Name $appPoolName
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedPipelineMode" -Value "Integrated"
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "startMode" -Value "AlwaysRunning"
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "processModel.idleTimeout" -Value "00:00:00"

Write-Host "  ✓ Application pool created: $appPoolName" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Creating IIS Website..." -ForegroundColor Green

# Remove existing site if it exists
if (Test-Path "IIS:\Sites\$siteName") {
    Remove-Website -Name $siteName
    Write-Host "  ✓ Removed existing website" -ForegroundColor Yellow
}

# Create website
New-Website -Name $siteName -ApplicationPool $appPoolName -PhysicalPath $deployPath -Port $port -Force

Write-Host "  ✓ Website created: $siteName" -ForegroundColor Green

Write-Host ""
Write-Host "Step 7: Configuring WebSocket support..." -ForegroundColor Green

# WebSocket is configured via web.config, just verify it exists
if (Test-Path (Join-Path $deployPath "web.config")) {
    Write-Host "  ✓ web.config found (WebSocket enabled)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: web.config not found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 8: Starting services..." -ForegroundColor Green

# Start the application pool
Start-WebAppPool -Name $appPoolName
Write-Host "  ✓ Application pool started" -ForegroundColor Green

# Start the website
Start-Website -Name $siteName
Write-Host "  ✓ Website started" -ForegroundColor Green

Write-Host ""
Write-Host "Step 9: Configuring firewall rules..." -ForegroundColor Green

# Remove existing rules if they exist
if (Get-NetFirewallRule -DisplayName "Coffee POS HTTP" -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName "Coffee POS HTTP"
}

# Add firewall rule
New-NetFirewallRule -DisplayName "Coffee POS HTTP" -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port | Out-Null

Write-Host "  ✓ Firewall rule added for port $port" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Coffee POS System is now available at:" -ForegroundColor Yellow
Write-Host "  http://localhost:$port" -ForegroundColor Cyan
Write-Host "  http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: 1234" -ForegroundColor White
Write-Host ""
Write-Host "Deployment location: $deployPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "To manage your site:" -ForegroundColor Yellow
Write-Host "  1. Open IIS Manager (run: inetmgr)" -ForegroundColor White
Write-Host "  2. Find '$siteName' under Sites" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see IIS_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
