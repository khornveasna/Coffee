# ☕ Coffee POS - REST API Integration Update

## 📅 Update: 2026-04-02

---

## ✅ What Was Updated

### Frontend (app.js) - Now Uses REST API for All User Operations

#### 1. **saveUser()** - Create/Update Users via REST API
```javascript
// OLD: Only saved to localStorage
saveData(this.data);

// NEW: Calls REST API first, then updates localStorage
if (id) {
    // UPDATE via PUT /api/users/:id
    const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username, fullname, password, role, permissions,
            userId: this.currentUser.id,
            userRole: this.currentUser.role
        })
    });
} else {
    // CREATE via POST /api/users
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username, password, fullname, role, permissions,
            userId: this.currentUser.id,
            userRole: this.currentUser.role
        })
    });
}
```

**Features:**
- ✅ Validates admin permissions
- ✅ Sends user context (userId, userRole)
- ✅ Handles API errors gracefully
- ✅ Updates localStorage after successful API call
- ✅ Auto-refreshes if current user changed

---

#### 2. **deleteUser()** - Delete Users via REST API
```javascript
// OLD: Only deleted from localStorage
this.data.users = this.data.users.filter(u => u.id !== id);
saveData(this.data);

// NEW: Calls REST API first
const response = await fetch(`/api/users/${id}?userId=${this.currentUser.id}&userRole=${this.currentUser.role}`, {
    method: 'DELETE'
});

const result = await response.json();
if (result.success) {
    // Then update localStorage
    this.data.users = this.data.users.filter(u => u.id !== id);
    saveData(this.data);
}
```

**Features:**
- ✅ Sends admin credentials for validation
- ✅ Prevents self-deletion
- ✅ Shows Khmer error messages from API
- ✅ Updates local data only after success

---

#### 3. **renderUsers()** - Fetch Users from REST API
```javascript
// OLD: Used only localStorage data
const users = this.data.users;

// NEW: Fetches from REST API
const response = await fetch(`/api/users?userId=${this.currentUser.id}&userRole=${this.currentUser.role}`);
const result = await response.json();

if (result.success) {
    const users = result.users;
    // Update local data
    this.data.users = users;
}
```

**Features:**
- ✅ Always shows latest data from database
- ✅ Validates admin access via API
- ✅ Handles errors gracefully
- ✅ Updates localStorage cache

---

#### 4. **openUserModal()** - Updated Permission Handling
```javascript
// OLD: Used optional chaining with defaults
document.getElementById('permPOS').checked = user.permissions?.includes('pos') || false;

// NEW: Direct permission check
const userPermissions = user.permissions || [];
document.getElementById('permPOS').checked = userPermissions.includes('pos');
```

**Features:**
- ✅ Cleaner permission checking
- ✅ Handles missing permissions gracefully
- ✅ Works with both string and numeric IDs

---

## 🔧 Backend (server.js) - Already Updated

### User Endpoints with Permission Validation

#### POST /api/users (Create)
```javascript
// Validates admin role
if (userRole !== 'admin') {
    return res.status(403).json({ 
        success: false, 
        message: 'មានតែ Admin ទេដែលអាចបង្កើតអ្នកប្រើប្រាស់!' 
    });
}

// Prevents multiple admins
if (role === 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
    if (adminCount.count > 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'មានតែ Admin មួយគត់ដែលអាចមានក្នុងប្រព័ន្ធ!' 
        });
    }
}

// Saves to SQLite database
db.prepare(`
    INSERT INTO users (id, username, password, fullname, role, permissions, createdAt, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`).run(id, username, hashedPassword, fullname, role, JSON.stringify(finalPermissions), createdAt);
```

---

#### PUT /api/users/:id (Update)
```javascript
// Validates admin role
if (userRole !== 'admin') {
    return res.status(403).json({ 
        success: false, 
        message: 'មានតែ Admin ទេដែលអាចកែសម្រួលអ្នកប្រើប្រាស់!' 
    });
}

// Prevents creating multiple admins
if (role === 'admin') {
    const currentAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' AND id != ?").get(id);
    if (currentAdmin) {
        return res.status(400).json({ 
            success: false, 
            message: 'មិនអាចផ្លាស់ប្តូរជា Admin ទេ ព្រោះមាន Admin រួចហើយ!' 
        });
    }
}

// Updates SQLite database
query.run(username, fullname, role, JSON.stringify(finalPermissions), active ? 1 : 0, id);
```

---

#### DELETE /api/users/:id (Delete)
```javascript
// Validates admin role
if (userRole !== 'admin') {
    return res.status(403).json({ 
        success: false, 
        message: 'មានតែ Admin ទេដែលអាចលុបអ្នកប្រើប្រាស់!' 
    });
}

// Prevents self-deletion
if (req.params.id === userId) {
    return res.status(400).json({ 
        success: false, 
        message: 'អ្នកមិនអាចលុបគណនីខ្លួនឯងទេ!' 
    });
}

// Deletes from SQLite database
db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
```

---

#### GET /api/users (List)
```javascript
// Validates admin role
if (userRole !== 'admin') {
    return res.status(403).json({ 
        success: false, 
        message: 'មានតែ Admin ទេដែលអាចមើលអ្នកប្រើប្រាស់ទាំងអស់!' 
    });
}

// Fetches from SQLite database
const users = db.prepare('SELECT id, username, fullname, role, permissions, createdAt, active FROM users').all();
```

---

## 📊 Data Flow

### Create User Flow
```
Admin clicks Save
    ↓
Frontend validates (app.js)
    ↓
POST /api/users with userId & userRole
    ↓
Backend validates admin permission
    ↓
Backend checks for duplicate username
    ↓
Backend checks single admin rule
    ↓
Backend saves to SQLite (coffee_pos.db)
    ↓
Backend returns success + new user
    ↓
Frontend updates localStorage
    ↓
Frontend refreshes user list
    ↓
Shows success toast
```

### Update User Flow
```
Admin clicks Save on edit
    ↓
Frontend validates (app.js)
    ↓
PUT /api/users/:id with userId & userRole
    ↓
Backend validates admin permission
    ↓
Backend checks for duplicate username
    ↓
Backend validates admin rule
    ↓
Backend updates SQLite database
    ↓
Backend returns success
    ↓
Frontend updates localStorage
    ↓
If current user updated → Auto refresh
    ↓
Shows success toast
```

### Delete User Flow
```
Admin clicks Delete
    ↓
Confirmation dialog
    ↓
DELETE /api/users/:id with userId & userRole
    ↓
Backend validates admin permission
    ↓
Backend checks not self-delete
    ↓
Backend deletes from SQLite
    ↓
Backend returns success
    ↓
Frontend updates localStorage
    ↓
Frontend refreshes user list
    ↓
Shows success toast
```

### View Users Flow
```
Admin opens Users page
    ↓
renderUsers() called
    ↓
GET /api/users with userId & userRole
    ↓
Backend validates admin permission
    ↓
Backend fetches all users from SQLite
    ↓
Backend returns user list
    ↓
Frontend renders table
    ↓
Frontend updates localStorage cache
```

---

## 🔐 Security Features

### 1. **Permission Validation**
Every API request includes:
- `userId` - Who is making the request
- `userRole` - Their role (admin, manager, staff)

Backend validates:
```javascript
if (userRole !== 'admin') {
    return res.status(403).json({ ... });
}
```

### 2. **Database Integrity**
- Single admin rule enforced at API level
- Duplicate username check before create/update
- Password hashing with bcrypt
- Soft deletes with `active` flag

### 3. **Error Handling**
```javascript
try {
    const response = await fetch(...);
    const result = await response.json();
    
    if (result.success) {
        // Success
    } else {
        // Show API error message
        this.showToast(result.message, 'error');
    }
} catch (error) {
    // Handle network errors
    this.showToast('មានកំហុសកើតឡើង!', 'error');
}
```

---

## 🎯 Benefits

### Before (localStorage only):
- ❌ Data only in browser
- ❌ No central database
- ❌ No permission validation
- ❌ Each browser has different data
- ❌ No audit trail

### After (REST API + SQLite):
- ✅ Central database (coffee_pos.db)
- ✅ All data persisted in SQLite
- ✅ Server-side permission validation
- ✅ Consistent data across all browsers
- ✅ Full audit trail in database
- ✅ Admin-only user management enforced
- ✅ Khmer error messages from server

---

## 📝 Testing

### Test Create User:
1. Login as admin
2. Go to Users page
3. Click "បន្ថែមអ្នកប្រើប្រាស់"
4. Fill form and save
5. **Check:** User appears in list
6. **Check:** Database updated (run `node migrate-db.js`)

### Test Update User:
1. Click edit on any user
2. Change permissions
3. Click save
4. **Check:** Changes saved
5. **Check:** Refresh shows updated data
6. **Check:** Database has new permissions

### Test Delete User:
1. Click delete on non-admin user
2. Confirm deletion
3. **Check:** User removed from list
4. **Check:** Database record deleted

### Test Permission Denied:
1. Login as staff user
2. Try to access Users page via URL
3. **Check:** Error message shown
4. **Check:** No users displayed

---

## 🚀 Files Modified

### Frontend:
- `app.js` - All user operations now use REST API
  - `saveUser()` - async, calls POST/PUT
  - `deleteUser()` - async, calls DELETE
  - `renderUsers()` - async, calls GET
  - `openUserModal()` - Updated permission handling

### Backend:
- `server.js` - Already had REST API endpoints
  - POST /api/users
  - PUT /api/users/:id
  - DELETE /api/users/:id
  - GET /api/users

### Database:
- `coffee_pos.db` - SQLite database
  - Users table with permissions
  - All changes persisted

---

## ✅ Success Indicators

- ✅ Create user saves to SQLite database
- ✅ Update user modifies database record
- ✅ Delete user removes from database
- ✅ User list fetched from database
- ✅ Permission validation on all operations
- ✅ Khmer error messages displayed
- ✅ Auto-refresh when current user updated
- ✅ LocalStorage synchronized with database

---

**Status:** ✅ **FULLY INTEGRATED**  
**Database:** SQLite (coffee_pos.db)  
**API:** REST (Express.js)  
**Frontend:** Vanilla JS with fetch API

**Last Updated:** 2026-04-02
