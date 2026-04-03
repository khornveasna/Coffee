# ☕ Coffee POS System - User Permission Guide

## 🔐 User Roles & Permissions

### **Admin** (មានសិទ្ធិពេញលេញ)
- ✅ **លក់ (POS)** - Can process sales
- ✅ **ការគ្រប់គ្រងទំនិញ** - Can manage products/items
- ✅ **ការលក់** - Can view all orders
- ✅ **របាយការណ៍** - Can view reports
- ✅ **អ្នកប្រើប្រាស់** - **ONLY Admin can see and manage users**

**Special Admin Features:**
- Only ONE admin can exist in the system
- Only admin can create/edit/delete users
- Only admin can assign permissions to other users
- Admin automatically has all permissions
- Cannot be deleted (self-protection)

---

### **Manager** (អ្នកគ្រប់គ្រងរង)
Permissions assigned by Admin:
- ☑️ លក់ (POS)
- ☑️ ការគ្រប់គ្រងទំនិញ
- ☑️ ការលក់
- ☑️ របាយការណ៍
- ❌ អ្នកប្រើប្រាស់ (Cannot see users page)

---

### **Staff** (បុគ្គលិក)
Permissions assigned by Admin:
- ☑️ លក់ (POS)
- ☑️ ការលក់ (View orders)
- ❌ ការគ្រប់គ្រងទំនិញ (Cannot manage items)
- ❌ របាយការណ៍ (Cannot view reports)
- ❌ អ្នកប្រើប្រាស់ (Cannot see users)

---

## 🎯 How Admin Controls User Permissions

### 1. **Login as Admin**
   - Username: `admin`
   - Password: `1234`

### 2. **Access Users Page**
   - Click on **អ្នកប្រើប្រាស់** in sidebar
   - Only visible to Admin

### 3. **Create New User**
   - Click **បន្ថែមអ្នកប្រើប្រាស់**
   - Fill in:
     - ឈ្មោះអ្នកប្រើប្រាស់ (Username)
     - ឈ្មោះពេញ (Full Name)
     - ពាក្យសម្ងាត់ (Password)
     - តួនាទី (Role: Staff/Manager/Admin*)
   
   *Note: Cannot create new admin if one already exists

### 4. **Assign Permissions (សិទ្ធិប្រើប្រាស់)**
   Admin can grant specific access:
   
   - **លក់ (POS)** - Access to sales/POS screen
   - **គ្រប់គ្រងមុខម្ហូប** - Add/edit/delete products
   - **មើលការលក់** - View order history
   - **របាយការណ៍** - View sales reports

### 5. **Edit User**
   - Click edit button on user row
   - Can change permissions anytime
   - Can change password (leave blank to keep current)

### 6. **Delete User**
   - Click delete button
   - Cannot delete yourself (current admin)

---

## 🔒 Security Features

### Permission Enforcement:
1. **Navigation Hidden** - Menu items hidden based on permissions
2. **Page Access Blocked** - Direct navigation shows error toast
3. **Admin-Only Actions** - User management restricted to admin
4. **Single Admin Rule** - Only one admin account allowed

### Error Messages:
- "មានតែ Admin ទេដែលអាចគ្រប់គ្រងអ្នកប្រើប្រាស់!" 
- "អ្នកមិនមានសិទ្ធិចូលមើលផ្នែកនេះទេ!"
- "មានតែ Admin មួយគត់ដែលអាចមានក្នុងប្រព័ន្ធ!"

---

## 📊 Permission Matrix

| Feature | Admin | Manager | Staff |
|---------|-------|---------|-------|
| **លក់ (POS)** | ✅ | ⚠️ | ⚠️ |
| **គ្រប់គ្រងទំនិញ** | ✅ | ⚠️ | ❌ |
| **មើលការលក់** | ✅ | ⚠️ | ⚠️ |
| **របាយការណ៍** | ✅ | ⚠️ | ❌ |
| **គ្រប់គ្រងអ្នកប្រើប្រាស់** | ✅ | ❌ | ❌ |
| **កំណត់សិទ្ធិ** | ✅ | ❌ | ❌ |

✅ = Always has access  
⚠️ = Can be granted by Admin  
❌ = No access

---

## 🚀 Usage Example

### Scenario: Create Cashier Staff

1. **Admin logs in** → admin / 1234
2. **Go to Users** → Click អ្នកប្រើប្រាស់
3. **Add User** → បន្ថែមអ្នកប្រើប្រាស់
4. **Fill Details:**
   - Username: `cashier1`
   - Full Name: `នាង វី ណា`
   - Password: `1234`
   - Role: `Staff`
5. **Set Permissions:**
   - ✅ លក់ (POS) - Can process sales
   - ❌ គ្រប់គ្រងមុខម្ហូប - Cannot change prices
   - ❌ មើលការលក់ - Cannot see all orders
   - ❌ របាយការណ៍ - Cannot view reports
6. **Save** → User created with limited access

### Result:
- Cashier can ONLY access POS screen
- Cannot see Items, Reports, or Users pages
- Admin can see all cashier's sales in Reports

---

## 💡 Best Practices

1. **Keep Admin Secure**
   - Don't share admin password
   - Only one trusted person should be admin

2. **Grant Minimum Permissions**
   - Give staff only what they need
   - Cashier → POS only
   - Supervisor → POS + Reports

3. **Regular Review**
   - Check user list periodically
   - Remove inactive users
   - Update permissions as roles change

4. **Backup Data**
   - Export orders regularly
   - Keep user list documented

---

## 🛠️ Technical Notes

- Permissions stored in `data.js` (localStorage)
- Admin role automatically gets all permissions
- Permission checks on every navigation
- UI elements hidden/shown based on permissions
- Error toasts shown for unauthorized access

---

**System Version:** 1.0  
**Last Updated:** 2026-04-02
