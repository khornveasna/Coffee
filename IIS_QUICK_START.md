# Quick IIS Deployment - 5 Steps

## ⚡ Quick Start (Automated)

### Option 1: PowerShell Script (Recommended)
1. Right-click `deploy-iis.ps1`
2. Select **"Run with PowerShell"** as Administrator
3. Wait for completion
4. Open browser: `http://localhost`

### Option 2: Batch Script
1. Right-click `deploy-iis.bat`
2. Select **"Run as administrator"**
3. Wait for completion
4. Open browser: `http://localhost`

---

## 📋 Manual Deployment (5 Steps)

### Step 1: Install Prerequisites
- ✅ Node.js: https://nodejs.org/
- ✅ IISNode: https://github.com/Azure/iisnode/releases
- ✅ URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite

### Step 2: Enable IIS
- Open "Turn Windows features on or off"
- Enable **Internet Information Services**
- Enable **WebSocket Protocol**

### Step 3: Install Dependencies
```cmd
cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
npm install --production
```

### Step 4: Configure IIS
1. Open IIS Manager (`inetmgr`)
2. Create Application Pool: `CoffeePOS_Pool` (.NET: No Managed Code)
3. Create Website pointing to your folder
4. Set port (e.g., 80 or 8080)

### Step 5: Set Permissions
```cmd
icacls "c:\Users\K-VeaSna\Desktop\Coffee POS System" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

✅ **Done!** Visit: `http://localhost`

---

## 🔑 Default Credentials
- **Username:** `admin`
- **Password:** `1234`

---

## 🛠️ Common Commands

### Restart Application
```cmd
iisreset /restart
```

### Check Site Status
```cmd
appcmd list site /name:"Coffee POS System"
```

### View Logs
```
C:\inetpub\logs\LogFiles\
```

---

## 📁 Files Created
- `web.config` - IIS configuration
- `deploy-iis.ps1` - PowerShell deployment script
- `deploy-iis.bat` - Batch deployment script
- `IIS_DEPLOYMENT_GUIDE.md` - Full documentation

---

## ❓ Troubleshooting

**500 Error?** Check IIS logs in `C:\inetpub\logs\LogFiles`

**Port in use?** Change port in IIS Manager → Site Bindings

**Database error?** Ensure `coffee_pos.db` has Write permissions for IIS_IUSRS

**WebSocket not working?** Verify WebSocket Protocol is enabled in Windows Features

---

For detailed information, see `IIS_DEPLOYMENT_GUIDE.md`
