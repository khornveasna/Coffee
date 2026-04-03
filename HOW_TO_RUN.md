# ☕ How to Run Coffee POS System

## 📋 Prerequisites

Make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ All files in `Coffee POS System` folder
- ✅ Internet connection (for CDN resources)

---

## 🚀 Step-by-Step Guide

### Step 1: Open Command Prompt/PowerShell

Press `Win + R`, type `cmd`, press Enter

OR

Search for "Command Prompt" in Windows Start menu

---

### Step 2: Navigate to Project Folder

```bash
cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
```

Press **Enter**

---

### Step 3: Install Dependencies (First Time Only)

```bash
npm install
```

Press **Enter**

Wait for installation to complete (about 10-30 seconds)

**You should see:**
```
added XX packages, and audited XX packages in XXs
```

> ⚠️ **Note:** You only need to do this once. Skip this step next time.

---

### Step 4: Start the REST API Server

```bash
node server.js
```

Press **Enter**

**You should see:**
```
☕ Coffee POS API Server running on http://localhost:3000
📊 SQLite Database: coffee_pos.db

API Endpoints:
  POST   /api/auth/login
  GET    /api/users
  ...
```

> ✅ **Keep this window open!** The server needs to stay running.

---

### Step 5: Open the Application

**Open your browser and go to:**
```
http://localhost:3000
```

---

### Step 6: Login to the System

**Default Admin Account:**
- **Username:** `admin`
- **Password:** `1234`

Enter these and click **ចូលប្រើប្រាស់** (Login)

---

## ✅ Success! You're In

You should now see the Coffee POS dashboard with:
- ✅ Sidebar menu (លក់, ការគ្រប់គ្រងទំនិញ, ការលក់, របាយការណ៍, អ្នកប្រើប្រាស់)
- ✅ Products grid
- ✅ Cart section
- ✅ Your name in the sidebar (អ្នកគ្រប់គ្រង)

---

## 🔄 How to Run Next Time

### Quick Start (After First Setup):

1. **Open Command Prompt**
2. **Navigate to folder:**
   ```bash
   cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
   ```
3. **Start server:**
   ```bash
   node server.js
   ```
4. **Open browser:**
   - Go to: `http://localhost:3000`
5. **Login** with `admin` / `1234`

---

## 🛑 How to Stop the Server

**In the Command Prompt window where server is running:**
- Press `Ctrl + C`
- Type `Y` and press Enter if asked

OR

**Close the Command Prompt window**

---

## 🔧 Troubleshooting

### Problem: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` again

### Problem: "Port 3000 already in use"
**Solution:**
```bash
taskkill /F /IM node.exe
```
Then restart server

### Problem: "Failed to connect to localhost:3000"
**Solution:**
1. Make sure server is running (check Command Prompt)
2. Wait 2-3 seconds after starting server
3. Try refreshing the browser

### Problem: "Database error"
**Solution:** Run database migration:
```bash
node migrate-db.js
```

---

## 📱 Quick Reference

### Start Everything:
```bash
cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
node server.js
```
Then open browser to: `http://localhost:3000`

### Login Credentials:
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `1234` |
| Manager | `manager` | `1234` |
| Staff | `staff` | `1234` |

### Important Files:
- `index.html` - Main application (loaded automatically)
- `server.js` - REST API server (run with Node.js)
- `coffee_pos.db` - SQLite database (auto-created)
- `app.js` - Frontend logic
- `styles.css` - Styles/design

---

## 🎯 First Steps After Login

### As Admin:
1. ✅ Go to **អ្នកប្រើប្រាស់** (Users) to create staff
2. ✅ Go to **ការគ្រប់គ្រងទំនិញ** (Items) to add products
3. ✅ Go to **លក់** (POS) to make sales
4. ✅ Go to **របាយការណ៍** (Reports) to view statistics

### As Staff:
1. ✅ Go to **លក់** (POS) to process orders
2. ✅ View order history in **ការលក់** (Orders)

---

## 📞 Need Help?

Check these documentation files:
- `QUICK_START.md` - Quick reference guide
- `USER_PERMISSIONS_GUIDE.md` - Permission system details
- `API_DOCUMENTATION.md` - API reference
- `REST_API_INTEGRATION.md` - Technical details

---

## 🎉 You're Ready!

Your Coffee POS System is now running with:
- ✅ REST API server on port 3000
- ✅ SQLite database for data persistence
- ✅ Admin-only user management
- ✅ Permission-based access control
- ✅ Khmer language support
- ✅ Responsive design for all devices

**Happy selling! ☕**

---

**Last Updated:** 2026-04-02
**Version:** 1.0
