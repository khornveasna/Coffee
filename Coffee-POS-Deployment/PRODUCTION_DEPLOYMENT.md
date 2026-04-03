# Production Deployment Guide

## 🚀 Overview

This guide covers deploying Coffee POS System to production environments, including IIS, direct Node.js deployment, and using PM2 process manager.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [IIS Deployment](#iis-deployment)
4. [Direct Node.js Deployment](#direct-nodejs-deployment)
5. [PM2 Deployment (Recommended)](#pm2-deployment-recommended)
6. [Security Hardening](#security-hardening)
7. [Database Management](#database-management)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** >= 14.0.0 (LTS recommended)
- **npm** >= 6.0.0
- **Windows Server 2012 R2+** or **Windows 10/11 Pro**
- **IIS** (for IIS deployment only)
- **IISNode** module (for IIS deployment only)
- **URL Rewrite Module** (for IIS deployment only)

### System Requirements
- **CPU**: 1+ cores
- **RAM**: 512MB minimum, 1GB recommended
- **Disk**: 100MB + database size
- **Network**: Port 80/443 or custom port

---

## Quick Deployment

### Automated Deployment (IIS)

1. **Open PowerShell as Administrator**
2. Navigate to project folder:
   ```powershell
   cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
   ```

3. **Run deployment script**:
   ```powershell
   .\deploy-iis.ps1
   ```

4. **Access application**:
   - Open browser: `http://localhost`
   - Login: `admin` / `1234`

### Manual Quick Start

```bash
# 1. Install dependencies
npm install --production

# 2. Configure environment
copy .env.example .env
# Edit .env and set SESSION_SECRET

# 3. Run migrations
node migrate-db.js

# 4. Start server
npm start

# 5. Open browser
# http://localhost:3000
```

---

## IIS Deployment

### Step 1: Install Prerequisites

```powershell
# Enable IIS with required features (Run as Administrator)
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebSockets
```

Download and install:
- **IISNode**: https://github.com/Azure/iisnode/releases
- **URL Rewrite**: https://www.iis.net/downloads/microsoft/url-rewrite

### Step 2: Prepare Application

```bash
cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"

# Install production dependencies
npm install --production

# Create environment file
copy .env.example .env

# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to .env file SESSION_SECRET=...
```

### Step 3: Set Permissions

```powershell
# Grant IIS_IUSRS permissions
icacls "c:\Users\K-VeaSna\Desktop\Coffee POS System" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

### Step 4: Configure IIS

**Option A: Using Script (Recommended)**
```powershell
.\deploy-iis.ps1
```

**Option B: Manual Configuration**

1. Open IIS Manager (`inetmgr`)
2. Create Application Pool:
   - Name: `CoffeePOS_Pool`
   - .NET CLR: `No Managed Code`
   - Pipeline: `Integrated`
   - Start Mode: `AlwaysRunning`

3. Create Website:
   - Site Name: `Coffee POS System`
   - Application Pool: `CoffeePOS_Pool`
   - Physical Path: Your project folder
   - Port: `80` or `8080`

4. Verify `web.config` is present and configured

### Step 5: Configure Firewall

```cmd
netsh advfirewall firewall add rule name="Coffee POS HTTP" dir=in action=allow protocol=TCP localport=80
```

### Step 6: Test

Open browser: `http://localhost`

---

## Direct Node.js Deployment

### Step 1: Prepare Server

```bash
# Create deployment directory
mkdir C:\CoffeePOS
xcopy "c:\Users\K-VeaSna\Desktop\Coffee POS System\*" C:\CoffeePOS\ /E /I /Y

cd C:\CoffeePOS

# Install dependencies
npm install --production

# Configure environment
copy .env.example .env
# Edit .env with your settings
```

### Step 2: Start Server

**Option A: Direct Start**
```bash
node server.js
```

**Option B: Using Production Wrapper**
```bash
set NODE_ENV=production
node server.js
```

**Option C: Using npm**
```bash
npm start
```

### Step 3: Keep Running (Windows Service)

Use **NSSM** (Non-Sucking Service Manager):

```bash
# Download NSSM: https://nssm.cc/download

# Install as Windows Service
nssm install CoffeePOS "C:\Program Files\nodejs\node.exe" "C:\CoffeePOS\server.js"

# Configure service
nssm edit CoffeePOS

# Start service
nssm start CoffeePOS
```

---

## PM2 Deployment (Recommended)

### Step 1: Install PM2

```bash
npm install -g pm2
```

### Step 2: Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'coffee-pos',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

### Step 3: Start with PM2

```bash
# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs coffee-pos

# Restart
pm2 restart coffee-pos

# Stop
pm2 stop coffee-pos

# Monitor
pm2 monit
```

---

## Security Hardening

### 1. Environment Variables

Create `.env` with secure values:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<generate-random-string>
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Change Default Passwords

Immediately after deployment:
1. Login as `admin` / `1234`
2. Go to Users management
3. Change admin password
4. Delete or disable default accounts if needed

### 3. Enable HTTPS

**Option A: IIS with SSL**
1. Obtain SSL certificate
2. In IIS Manager → Site → Bindings
3. Add HTTPS binding with certificate
4. Redirect HTTP to HTTPS

**Option B: Reverse Proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Configure CORS

In `.env`:
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 5. File Permissions

```powershell
# Minimum required permissions
icacls "C:\CoffeePOS" /grant "IIS_IUSRS:(OI)(CI)RX"
icacls "C:\CoffeePOS\coffee_pos.db" /grant "IIS_IUSRS:(OI)(CI)M"
icacls "C:\CoffeePOS\logs" /grant "IIS_IUSRS:(OI)(CI)M"
```

### 6. Security Headers

Already configured via Helmet in `server-production.js`:
- X-DNS-Prefetch-Control
- X-Frame-Options (SAMEORIGIN)
- Strict-Transport-Security (if HTTPS)
- X-XSS-Protection
- X-Content-Type-Options

### 7. Rate Limiting

Already configured:
- 100 requests per 15 minutes per IP
- Adjust in `.env` if needed

---

## Database Management

### Backup Database

**Manual Backup:**
```bash
npm run backup-db
```

**Or:**
```bash
backup-database.bat
```

**Automatic Backup (Windows Task Scheduler):**

Create scheduled task:
```powershell
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "scripts\backup-database.js" -WorkingDirectory "C:\CoffeePOS"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "CoffeePOS-Backup" -Action $action -Trigger $trigger -RunLevel Highest
```

### Restore Database

```bash
# Stop server first
# Copy backup file
copy "backups\coffee_pos-backup-YYYY-MM-DD.db" "coffee_pos.db"
# Restart server
```

### Database Maintenance

```bash
# Run migrations
node migrate-db.js

# Check database integrity
# Open SQLite CLI
sqlite3 coffee_pos.db "PRAGMA integrity_check;"
```

### Database Size Monitoring

```powershell
$dbPath = "C:\CoffeePOS\coffee_pos.db"
$dbSize = (Get-Item $dbPath).Length / 1MB
Write-Host "Database size: $([math]::Round($dbSize, 2)) MB"
```

---

## Monitoring & Maintenance

### Health Check

**Endpoint:**
```
GET http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "ok",
    "timestamp": "2026-04-03T...",
    "uptime": 12345,
    "memory": {...},
    "version": "1.0.0",
    "environment": "production"
  }
}
```

### Monitoring Script

Create `monitor.ps1`:
```powershell
$url = "http://localhost:3000/api/health"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing

if ($response.StatusCode -eq 200) {
    $health = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($health.health.status)"
    Write-Host "Uptime: $([math]::Round($health.health.uptime / 3600, 2)) hours"
    Write-Host "Memory: $([math]::Round($health.health.memory.heapUsed / 1024 / 1024, 2)) MB"
} else {
    Write-Host "ERROR: Health check failed!"
    exit 1
}
```

### Log Management

**Log Locations:**
- Application logs: `./logs/`
- IIS logs: `C:\inetpub\logs\LogFiles\`
- PM2 logs: `./logs/pm2-*.log`

**Log Rotation (IIS):**
Already configured in IIS with automatic rotation.

**Clean Old Logs:**
```bash
npm run clean
```

### Performance Monitoring

**Memory Usage:**
- Check health endpoint
- PM2: `pm2 monit`
- Windows Task Manager

**Database Size:**
- Monitor `coffee_pos.db` file size
- Set alerts if > 500MB

**Response Times:**
- Use browser DevTools Network tab
- Monitor IIS logs for slow requests

---

## Troubleshooting

### Application Won't Start

**Check:**
```bash
# Node.js installed?
node --version

# Dependencies installed?
npm install --production

# Port in use?
netstat -ano | findstr :3000

# Check logs
type logs\*.log
```

### 500 Internal Server Error

**Check:**
1. IIS logs: `C:\inetpub\logs\LogFiles\`
2. Application logs
3. File permissions
4. Database accessibility

### Database Locked Error

**Solution:**
```bash
# Stop all instances
# Check for locked files
dir *.db-journal

# Remove journal files if safe
del *.db-journal

# Restart server
```

### WebSocket Not Working

**Check:**
1. WebSocket Protocol enabled in IIS?
2. `web.config` has `<webSocket enabled="true" />`
3. Firewall not blocking WebSocket
4. Browser console for errors

### High Memory Usage

**Solution:**
```bash
# Restart application
iisreset /restart
# or
pm2 restart coffee-pos

# Check for memory leaks
# Monitor health endpoint memory usage
```

### Cannot Access from Network

**Check:**
```bash
# Firewall rules
netsh advfirewall firewall show rule name="Coffee POS HTTP"

# Add rule if missing
netsh advfirewall firewall add rule name="Coffee POS HTTP" dir=in action=allow protocol=TCP localport=3000

# Check binding
netstat -ano | findstr :3000
```

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | `production` | Yes |
| `PORT` | Server port | `3000` | No |
| `SESSION_SECRET` | Session encryption key | *(change me)* | **Yes** |
| `DATABASE_PATH` | Database file path | `./coffee_pos.db` | No |
| `CORS_ORIGINS` | Allowed origins | `*` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `BACKUP_ENABLED` | Enable backups | `false` | No |
| `BACKUP_INTERVAL_HOURS` | Backup interval | `24` | No |
| `BACKUP_DIR` | Backup directory | `./backups` | No |

---

## Support & Resources

- **Documentation**: See `IIS_DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `IIS_QUICK_START.md`
- **Checklist**: See `PRODUCTION_CHECKLIST.md`
- **API Docs**: See `API_DOCUMENTATION.md`
- **GitHub Issues**: Report bugs and feature requests

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-03 | Initial production release |

---

**Last Updated**: 2026-04-03
**Maintained By**: Coffee POS System Team
