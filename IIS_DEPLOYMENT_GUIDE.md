# Coffee POS System - IIS Deployment Guide

## Prerequisites

Before deploying to IIS, ensure you have the following installed:

1. **Windows Server 2012 R2 or later** (or Windows 10/11 Pro for testing)
2. **IIS (Internet Information Services)** with specific features enabled
3. **Node.js** (LTS version recommended)
4. **IISNode** module for IIS
5. **URL Rewrite Module** for IIS

## Step-by-Step Installation

### Step 1: Install IIS with Required Features

1. Open **Server Manager** (or "Turn Windows features on or off" on Windows 10/11)
2. Click **Add Roles and Features**
3. Select **Web Server (IIS)**
4. Under **Application Development**, ensure these are checked:
   - ✅ WebSocket Protocol
   - ✅ Server-Side Includes (optional)
5. Under **Security**, ensure:
   - ✅ Windows Authentication (if needed)
   - ✅ Request Filtering
6. Complete the installation

### Step 2: Install Node.js

1. Download Node.js LTS from: https://nodejs.org/
2. Install with default settings
3. Verify installation by opening Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

### Step 3: Install IISNode

1. Download IISNode from: https://github.com/Azure/iisnode/releases
   - Choose the latest stable release (e.g., `iisnode-full-v0.2.21-x64.msi`)
2. Run the installer with Administrator privileges
3. Follow the installation wizard
4. Restart IIS Manager after installation

### Step 4: Install URL Rewrite Module

1. Download URL Rewrite from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Run the installer
3. Restart IIS Manager

### Step 5: Prepare Your Application Files

1. Copy your entire Coffee POS System folder to the server:
   ```
   c:\Users\K-VeaSna\Desktop\Coffee POS System\
   ```
   
2. Move it to your desired deployment location, for example:
   ```
   C:\inetpub\wwwroot\CoffeePOS\
   ```

3. Open Command Prompt as Administrator and navigate to the folder:
   ```cmd
   cd C:\inetpub\wwwroot\CoffeePOS
   ```

4. Install production dependencies:
   ```cmd
   npm install --production
   ```

### Step 6: Set Permissions

The IIS application pool identity needs permissions to:
- Read application files
- Write to the database file (`coffee_pos.db`)

**Steps:**

1. Navigate to your application folder in File Explorer
2. Right-click the folder → **Properties** → **Security** tab
3. Click **Edit** → **Add**
4. Add: `IIS_IUSRS` (or `IIS APPPOOL\YourAppPoolName`)
5. Grant these permissions:
   - ✅ Read & execute
   - ✅ List folder contents
   - ✅ Read
   - ✅ Write (required for database operations)
6. Click **Apply** and **OK**

### Step 7: Create Application Pool in IIS

1. Open **IIS Manager** (run `inetmgr`)
2. In the left pane, expand your server node
3. Right-click **Application Pools** → **Add Application Pool**
4. Configure:
   - **Name**: `CoffeePOS_Pool`
   - **.NET CLR version**: `No Managed Code`
   - **Managed pipeline mode**: `Integrated`
5. Click **OK**
6. Select the new pool → **Advanced Settings** (right pane)
7. Set these settings:
   - **Identity**: `ApplicationPoolIdentity` (default)
   - **Enable 32-Bit Applications**: `False` (unless using 32-bit Node.js)
   - **Idle Time-out (minutes)**: `0` (prevents shutdown)
   - **Regular Time Interval (minutes)**: `0` (prevents recycling)

### Step 8: Create Website in IIS

1. In IIS Manager, right-click **Sites** → **Add Website**
2. Configure:
   - **Site name**: `Coffee POS System`
   - **Application pool**: `CoffeePOS_Pool` (select from dropdown)
   - **Physical path**: Browse to your app folder (e.g., `C:\inetpub\wwwroot\CoffeePOS`)
   - **Binding**: 
     - Type: `http`
     - IP address: `All Unassigned`
     - Port: `80` (or your preferred port like `8080`)
   - **Host name**: (optional, e.g., `coffee-pos.local`)
3. Click **OK**

### Step 9: Configure IIS Settings

1. Select your new site in IIS Manager
2. Double-click **Configuration Editor** (if available)
3. Navigate to `system.webServer/webSocket`
4. Ensure `enabled` is set to `true`

5. Double-click **Request Filtering**
6. Ensure `web.config` is allowed

### Step 10: Test the Application

1. Open a web browser
2. Navigate to:
   - Local: `http://localhost` (or your configured port)
   - Network: `http://YOUR_SERVER_IP:PORT`
3. You should see the Coffee POS login screen
4. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `1234`

## Troubleshooting

### Issue: 500 Internal Server Error

**Solution:**
1. Check IIS logs: `C:\inetpub\logs\LogFiles`
2. Check application logs in your app folder
3. Verify `web.config` is properly formatted
4. Ensure all files are present

### Issue: Cannot access database

**Solution:**
1. Verify `coffee_pos.db` exists in the app folder
2. Check file permissions (IIS_IUSRS needs Write access)
3. Check database path in `server.js` is relative

### Issue: WebSocket not working

**Solution:**
1. Ensure WebSocket Protocol is installed in IIS
2. Verify `<webSocket enabled="true" />` in web.config
3. Check firewall isn't blocking WebSocket connections

### Issue: Port already in use

**Solution:**
1. Change the port in IIS Manager:
   - Select your site → **Bindings** (right pane)
   - Edit binding and change port (e.g., 8080, 3000)
2. Or stop other services using port 80

### Issue: Static files not loading

**Solution:**
1. Verify MIME types are configured in IIS
2. Check static file handler is enabled
3. Ensure `web.config` rewrite rules exclude static files

## Production Best Practices

### 1. Enable HTTPS (SSL/TLS)

1. Obtain an SSL certificate (self-signed or from CA)
2. In IIS Manager, select your site → **Bindings**
3. Add HTTPS binding with your certificate
4. Update `server.js` to support HTTPS if needed

### 2. Configure Firewall

```cmd
# Allow HTTP traffic
netsh advfirewall firewall add rule name="Coffee POS HTTP" dir=in action=allow protocol=TCP localport=80

# Allow HTTPS traffic (if configured)
netsh advfirewall firewall add rule name="Coffee POS HTTPS" dir=in action=allow protocol=TCP localport=443
```

### 3. Set up Logging

In `web.config`, add logging configuration:
```xml
<system.webServer>
  <httpLogging dontLog="false" />
  <iisnode 
    loggingEnabled="true"
    logDirectory="logs"
    debuggingEnabled="true"
  />
</system.webServer>
```

### 4. Configure Auto-Start

Ensure your app starts automatically after server restart:

1. In IIS Manager, select your site
2. **Advanced Settings** → **Preload Enabled**: `True`
3. Application Pool → **Start Mode**: `AlwaysRunning`

### 5. Backup Database

Regularly backup `coffee_pos.db`:
```cmd
xcopy "C:\inetpub\wwwroot\CoffeePOS\coffee_pos.db" "C:\Backups\CoffeePOS\" /Y
```

## Monitoring

### Check Application Status

```cmd
# Check if app pool is running
appcmd list apppool /name:"CoffeePOS_Pool"

# Check site status
appcmd list site /name:"Coffee POS System"
```

### Restart Application

```cmd
# Restart app pool
iisreset /restart

# Or specific app pool
appcmd recycle apppool /apppool.name:"CoffeePOS_Pool"
```

### View Logs

- IIS Logs: `C:\inetpub\logs\LogFiles\W3SVC[ID]`
- Application Logs: Check your app's log directory
- Event Viewer: Windows Logs → Application

## Updating the Application

1. Stop the application pool:
   ```cmd
   appcmd stop apppool /apppool.name:"CoffeePOS_Pool"
   ```

2. Replace application files (keep `coffee_pos.db`)

3. Install any new dependencies:
   ```cmd
   npm install --production
   ```

4. Start the application pool:
   ```cmd
   appcmd start apppool /apppool.name:"CoffeePOS_Pool"
   ```

## Security Recommendations

1. **Change default passwords** immediately
2. **Enable HTTPS** in production
3. **Restrict file permissions** to minimum required
4. **Enable request filtering** in IIS
5. **Set up IP restrictions** if needed (IIS → IP Address and Domain Restrictions)
6. **Regular backups** of database and configuration
7. **Keep Node.js and IISNode updated**

## Support

For issues or questions:
- Check IIS documentation: https://docs.microsoft.com/en-us/iis/
- IISNode GitHub: https://github.com/Azure/iisnode
- Node.js documentation: https://nodejs.org/en/docs/
