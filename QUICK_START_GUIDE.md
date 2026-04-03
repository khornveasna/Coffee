# 🚀 Quick Start - Get Running in 5 Minutes

## ⚡ Fastest Way to Production

### Method 1: One-Click Preparation (Recommended)

**Step 1:** Double-click `prepare-for-production.bat`

**Step 2:** Wait for completion (~30 seconds)

**Step 3:** Open browser → `http://localhost:3000`

**Step 4:** Login → `admin` / `1234`

**✅ Done!** Start using your POS system.

---

### Method 2: IIS Deployment (For Production Server)

**Step 1:** Right-click `deploy-iis.ps1` → **Run with PowerShell** as Administrator

**Step 2:** Wait for completion (~1 minute)

**Step 3:** Open browser → `http://localhost`

**Step 4:** Login → `admin` / `1234`

**✅ Done!** Your POS is live on IIS!

---

## 📋 What Each Script Does

### `prepare-for-production.bat`
```
✓ Installs all dependencies (npm install)
✓ Creates .env configuration file
✓ Generates secure SESSION_SECRET automatically
✓ Creates logs/ and backups/ directories
✓ Runs database migrations
✓ Verifies installation
✓ Optionally starts the server
```

### `deploy-iis.ps1`
```
✓ Checks all prerequisites
✓ Creates IIS Application Pool
✓ Creates IIS Website
✓ Sets file permissions for IIS_IUSRS
✓ Configures firewall rules
✓ Installs npm packages
✓ Starts the site
```

---

## 🎯 After Deployment

### First Things To Do (In Order)

1. **Login** with `admin` / `1234`
2. **Change Admin Password** (Users management)
3. **Create Staff Accounts** (if needed)
4. **Add Products** (or use defaults)
5. **Create Test Order** (verify everything works)
6. **Test Backup** (run backup-database.bat)

---

## 🔧 Common Scenarios

### Scenario 1: Testing on Local Machine
```bash
# Use: prepare-for-production.bat
# Then: npm start
# Access: http://localhost:3000
```

### Scenario 2: Deploying to Company Server (IIS)
```powershell
# Use: deploy-iis.ps1 (as Administrator)
# Access: http://localhost or http://SERVER-IP
```

### Scenario 3: Production Server with Auto-Restart
```bash
# Install PM2
npm install -g pm2

# Start with config
pm2 start ecosystem.config.js

# Save and setup auto-start
pm2 save
pm2 startup
```

---

## 📁 File Quick Reference

| File | What It Does | When to Use |
|------|--------------|-------------|
| `prepare-for-production.bat` | Complete setup | First time, before running |
| `start-production.bat` | Start server | Every time you want to run |
| `deploy-iis.ps1` | Deploy to IIS | Production server deployment |
| `backup-database.bat` | Backup database | Regular backups |
| `.env.example` | Config template | Reference for settings |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm is not recognized" | Install Node.js from nodejs.org |
| Port 3000 in use | Run: `taskkill /F /IM node.exe` |
| Can't access from network | Check firewall, use server IP |
| Database error | Run: `node migrate-db.js` |
| 500 Error in IIS | Check IIS logs in `C:\inetpub\logs\LogFiles` |

---

## 🔐 Security Checklist

Before going live in production:

- [ ] Changed default admin password
- [ ] Generated unique SESSION_SECRET (done automatically)
- [ ] Set up HTTPS (if public-facing)
- [ ] Configured firewall rules
- [ ] Set up automatic backups
- [ ] Reviewed user permissions

---

## 📞 Need More Help?

| Topic | Read This File |
|-------|----------------|
| Complete setup guide | `PRODUCTION_READY_SUMMARY.md` |
| IIS deployment details | `IIS_DEPLOYMENT_GUIDE.md` |
| Production checklist | `PRODUCTION_CHECKLIST.md` |
| Full deployment guide | `PRODUCTION_DEPLOYMENT.md` |
| API reference | `API_DOCUMENTATION.md` |
| User permissions | `USER_PERMISSIONS_GUIDE.md` |

---

## ✨ That's It!

**You're ready to deploy and run your Coffee POS System!**

Questions? Check the documentation files above.

**Happy Selling! ☕**
