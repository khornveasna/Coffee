# ☕ Coffee POS - Quick Start Guide

## 🚀 Start the System

### 1. Open Command Prompt
```bash
cd "c:\Users\K-VeaSna\Desktop\Coffee POS System"
```

### 2. Start REST API Server
```bash
node server.js
```

**Server runs on:** http://localhost:3000

### 3. Open Browser
Go to: **http://localhost:3000**

---

## 🔑 Default Login

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `1234` | Full system access |
| Manager | `manager` | `1234` | POS, Items, Orders, Reports |
| Staff | `staff` | `1234` | POS, Orders only |

---

## 👥 Create New User (Admin Only)

1. **Login as admin** → `admin` / `1234`
2. Click **អ្នកប្រើប្រាស់** (Users) in sidebar
3. Click **បន្ថែមអ្នកប្រើប្រាស់** (Add User)
4. Fill in:
   - ឈ្មោះអ្នកប្រើប្រាស់ (Username)
   - ឈ្មោះពេញ (Full Name)
   - ពាក្យសម្ងាត់ (Password)
   - តួនាទី (Role: Staff/Manager)
5. **Check permissions** to grant:
   - ☑️ លក់ (POS)
   - ☑️ គ្រប់គ្រងមុខម្ហូប
   - ☑️ មើលការលក់
   - ☑️ របាយការណ៍
6. Click **រក្សាទុក** (Save)

---

## 🎯 Permission Icons

In the sidebar, next to your name:
- 📠 = លក់ (POS)
- 📦 = គ្រប់គ្រងមុខម្ហូប
- 🧾 = មើលការលក់
- 📊 = របាយការណ៍
- ✓ Admin = Full access (all features)

---

## 🔒 Important Rules

### ✅ Allowed
- Admin can create/edit/delete any user
- Admin can see all pages
- Users can access pages based on permissions
- Admin can grant specific permissions

### ❌ Not Allowed
- Only ONE admin account
- Non-admin cannot manage users
- Cannot access pages without permission
- Admin cannot delete themselves

---

## 🛠️ Common Tasks

### Reset Database
```bash
node migrate-db.js
```

### Test API
```bash
# Test login
curl http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"1234\"}"

# Get products
curl http://localhost:3000/api/products
```

### Check Database
```bash
# Open SQLite browser or use:
node -e "const db=require('better-sqlite3')('coffee_pos.db'); console.log(db.prepare('SELECT username,role FROM users').all())"
```

### Stop Server
```
Press Ctrl + C in the Command Prompt window
```

---

## 📱 Navigation

| Khmer | English | Permission Required |
|-------|---------|---------------------|
| លក់ | POS/Sales | pos |
| ការគ្រប់គ្រងទំនិញ | Items Management | items |
| ការលក់ | Orders | orders |
| របាយការណ៍ | Reports | reports |
| អ្នកប្រើប្រាស់ | Users | **Admin only** |

---

## ⚠️ Troubleshooting

**Problem:** Cannot access Users page
**Solution:** Only admin can access. Login as admin.

**Problem:** Permission denied error
**Solution:** Ask admin to grant required permission.

**Problem:** Multiple admins created
**Solution:** Database issue. Run migration or manually fix.

**Problem:** Server won't start
**Solution:** Check port 3000 is not in use. Kill process and restart.

**Problem:** Cannot connect to server
**Solution:** Make sure server is running at http://localhost:3000

---

## 📞 Support Files

- `API_DOCUMENTATION.md` - Complete API reference
- `USER_PERMISSIONS_GUIDE.md` - Detailed permission guide
- `DATABASE_UPDATE_SUMMARY.md` - What was updated
- `HOW_TO_RUN.md` - Detailed setup instructions
- `migrate-db.js` - Database migration tool

---

**Version:** 1.0
**Last Updated:** 2026-04-02
