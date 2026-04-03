# ☕ Coffee POS System - REST API Documentation

## 📋 Overview

**Base URL:** `http://localhost:3000`  
**Database:** SQLite (`coffee_pos.db`)  
**Authentication:** JWT-style with user credentials

---

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_admin",
    "username": "admin",
    "fullname": "អ្នកគ្រប់គ្រង",
    "role": "admin",
    "permissions": ["pos", "items", "orders", "reports", "users"],
    "createdAt": "2026-04-02T06:33:19.406Z",
    "active": 1
  }
}
```

**Default Credentials:**
| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `1234` | admin | All (Full Access) |
| `manager` | `1234` | manager | pos, items, orders, reports |
| `staff` | `1234` | staff | pos, orders |

---

## 👥 Users API

### Get All Users (Admin Only)
```http
GET /api/users?userId={id}&userRole=admin
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_admin",
      "username": "admin",
      "fullname": "អ្នកគ្រប់គ្រង",
      "role": "admin",
      "permissions": ["pos", "items", "orders", "reports", "users"],
      "createdAt": "2026-04-02T06:33:19.406Z",
      "active": 1
    }
  ]
}
```

### Get User by ID
```http
GET /api/users/{userId}?userRole=admin
```

### Create User (Admin Only)
```http
POST /api/users
Content-Type: application/json

{
  "username": "cashier1",
  "password": "1234",
  "fullname": "នាង វី ណា",
  "role": "staff",
  "permissions": ["pos", "orders"],
  "userId": "user_admin",
  "userRole": "admin"
}
```

**Rules:**
- Only admin can create users
- Only ONE admin account allowed
- Admin automatically gets all permissions

**Response:**
```json
{
  "success": true,
  "message": "បានបន្ថែមអ្នកប្រើប្រាស់!",
  "user": {
    "id": "uuid-here",
    "username": "cashier1",
    "fullname": "នាង វី ណា",
    "role": "staff",
    "permissions": ["pos", "orders"],
    "createdAt": "2026-04-02T10:00:00.000Z"
  }
}
```

### Update User (Admin Only)
```http
PUT /api/users/{userId}
Content-Type: application/json

{
  "username": "cashier1",
  "fullname": "នាង វី ណា",
  "role": "staff",
  "permissions": ["pos", "orders", "reports"],
  "active": true,
  "userId": "user_admin",
  "userRole": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "បានកែសម្រួលអ្នកប្រើប្រាស់!"
}
```

### Delete User (Admin Only)
```http
DELETE /api/users/{userId}?userId=adminId&userRole=admin
```

**Rules:**
- Only admin can delete users
- Admin cannot delete themselves

**Response:**
```json
{
  "success": true,
  "message": "បានលុបអ្នកប្រើប្រាស់!"
}
```

---

## 📦 Categories API

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "cat_coffee",
      "name": "Coffee",
      "name_km": "កាហ្វេ",
      "icon": "fa-coffee",
      "active": 1
    },
    {
      "id": "cat_tea",
      "name": "Tea",
      "name_km": "តែបៃតង",
      "icon": "fa-leaf",
      "active": 1
    }
  ]
}
```

### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Smoothie",
  "name_km": "ស្មូទី",
  "icon": "fa-glass-whiskey"
}
```

---

## ☕ Products API

### Get All Products
```http
GET /api/products?category=cat_coffee&search=កាហ្វេ&active=true
```

**Query Parameters:**
- `category` - Filter by category ID
- `search` - Search by name (Khmer or English)
- `active` - Filter by active status

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_1",
      "name": "កាហ្វេស្រស់",
      "name_km": "Fresh Coffee",
      "category_id": "cat_coffee",
      "price": 8000,
      "salePrice": 0,
      "image": null,
      "icon": "fa-coffee",
      "description": "កាហ្វេស្រស់ឆ្ងាញ់",
      "active": 1,
      "category_name": "Coffee",
      "category_name_km": "កាហ្វេ"
    }
  ]
}
```

### Get Product by ID
```http
GET /api/products/{productId}
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "កាហ្វេទឹកដោះគោ",
  "name_km": "Coffee with Milk",
  "category_id": "cat_coffee",
  "price": 10000,
  "salePrice": 0,
  "image": "data:image/jpeg;base64,...",
  "icon": "fa-coffee",
  "description": "កាហ្វេទឹកដោះគោផ្អែម",
  "active": true
}
```

### Update Product
```http
PUT /api/products/{productId}
Content-Type: application/json

{
  "name": "កាហ្វេទឹកដោះគោ",
  "category_id": "cat_coffee",
  "price": 12000,
  "salePrice": 10000,
  "active": true
}
```

### Delete Product
```http
DELETE /api/products/{productId}
```

---

## 🧾 Orders API

### Get All Orders
```http
GET /api/orders?date=2026-04-02&userId=user_admin&startDate=2026-04-01&endDate=2026-04-02
```

**Query Parameters:**
- `date` - Filter by specific date
- `startDate` - Start date range
- `endDate` - End date range
- `userId` - Filter by user

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "receiptNumber": "202604021234",
      "date": "2026-04-02T10:30:00.000Z",
      "items": "[{\"id\":\"prod_1\",\"name\":\"កាហ្វេស្រស់\",\"price\":8000,\"quantity\":2}]",
      "subtotal": 16000,
      "discountPercent": 0,
      "discountAmount": 0,
      "total": 16000,
      "paymentMethod": "cash",
      "userId": "user_admin",
      "userName": "អ្នកគ្រប់គ្រង"
    }
  ]
}
```

### Get Order by ID
```http
GET /api/orders/{orderId}
```

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "id": "prod_1",
      "name": "កាហ្វេស្រស់",
      "price": 8000,
      "quantity": 2
    }
  ],
  "subtotal": 16000,
  "discountPercent": 10,
  "discountAmount": 1600,
  "total": 14400,
  "paymentMethod": "cash",
  "userId": "user_admin",
  "userName": "អ្នកគ្រប់គ្រង"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "order-uuid",
    "receiptNumber": "202604021234",
    "date": "2026-04-02T10:30:00.000Z",
    "items": [...],
    "subtotal": 16000,
    "discountPercent": 10,
    "discountAmount": 1600,
    "total": 14400,
    "paymentMethod": "cash",
    "userId": "user_admin",
    "userName": "អ្នកគ្រប់គ្រង"
  }
}
```

### Delete Order
```http
DELETE /api/orders/{orderId}
```

---

## 📊 Reports API

### Get Sales Summary
```http
GET /api/reports/summary?startDate=2026-04-01&endDate=2026-04-02
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRevenue": 150000,
    "totalOrders": 25,
    "totalDiscount": 5000,
    "topProduct": "កាហ្វេស្រស់",
    "avgOrderValue": 6000
  }
}
```

---

## ⚙️ Settings API

### Get Settings
```http
GET /api/settings
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "shopName": "Coffee POS",
    "currency": "៛",
    "taxRate": "0"
  }
}
```

### Update Settings
```http
PUT /api/settings
Content-Type: application/json

{
  "settings": {
    "shopName": "New Coffee Shop",
    "currency": "៛",
    "taxRate": "10"
  }
}
```

---

## 🔒 Permission System

### User Roles

| Role | Access Level |
|------|-------------|
| **admin** | Full system access + user management |
| **manager** | POS, Items, Orders, Reports |
| **staff** | POS, Orders only |

### Permission Enforcement

All user-related API endpoints require:
- `userId` - Current user's ID
- `userRole` - Current user's role

**Example:**
```javascript
// Frontend must send user context with requests
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: currentUser.id,
    userRole: currentUser.role
  })
});
```

### Error Responses

**403 Forbidden - No Permission:**
```json
{
  "success": false,
  "message": "មានតែ Admin ទេដែលអាចមើលអ្នកប្រើប្រាស់ទាំងអស់!"
}
```

**400 Bad Request - Duplicate Admin:**
```json
{
  "success": false,
  "message": "មានតែ Admin មួយគត់ដែលអាចមានក្នុងប្រព័ន្ធ!"
}
```

---

## 🛠️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    permissions TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL,
    active INTEGER DEFAULT 1
)
```

### Products Table
```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_km TEXT,
    category_id TEXT,
    price REAL NOT NULL DEFAULT 0,
    salePrice REAL DEFAULT 0,
    image TEXT,
    icon TEXT DEFAULT 'fa-box',
    description TEXT,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

### Orders Table
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    receiptNumber TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    discountPercent REAL DEFAULT 0,
    discountAmount REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    paymentMethod TEXT NOT NULL DEFAULT 'cash',
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
)
```

---

## 🚀 Quick Start

1. **Start Server:**
   ```bash
   node server.js
   ```

2. **Run Migration (first time only):**
   ```bash
   node migrate-db.js
   ```

3. **Test Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"1234"}'
   ```

4. **Open Frontend:**
   ```
   http://localhost:3000/index.html
   ```

---

## 📝 Notes

- All monetary values in Cambodian Riel (៛)
- Passwords are hashed with bcrypt
- Permissions are stored as JSON arrays
- Admin role always has full permissions
- Only one admin account allowed
- Soft deletes use `active` flag

---

**Version:** 1.0  
**Last Updated:** 2026-04-02
