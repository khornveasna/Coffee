// Coffee POS System - REST API Server with SQLite and Real-time Sync
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3002;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new Database('coffee_pos.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        permissions TEXT DEFAULT '["pos","orders"]',
        createdAt TEXT NOT NULL,
        active INTEGER DEFAULT 1
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_km TEXT NOT NULL,
        icon TEXT DEFAULT 'fa-box',
        active INTEGER DEFAULT 1
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS products (
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
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
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
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
`);

// Insert default categories
const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoriesCount.count === 0) {
    db.exec(`
        INSERT INTO categories (id, name, name_km, icon) VALUES
        ('cat_coffee', 'Coffee', 'កាហ្វេ', 'fa-coffee'),
        ('cat_tea', 'Tea', 'តែបៃតង', 'fa-leaf')
    `);
}

// Insert default users
const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (usersCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('1234', 10);
    const now = new Date().toISOString();
    
    db.exec(`
        INSERT INTO users (id, username, password, fullname, role, permissions, createdAt, active) VALUES
        ('user_admin', 'admin', '${hashedPassword}', 'អ្នកគ្រប់គ្រង', 'admin', '["pos","items","orders","reports","users"]', '${now}', 1),
        ('user_manager', 'manager', '${hashedPassword}', 'អ្នកគ្រប់គ្រងរង', 'manager', '["pos","items","orders","reports"]', '${now}', 1),
        ('user_staff', 'staff', '${hashedPassword}', 'បុគ្គលិក', 'staff', '["pos","orders"]', '${now}', 1)
    `);
}

// Insert default products
const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productsCount.count === 0) {
    db.exec(`
        INSERT INTO products (id, name, name_km, category_id, price, salePrice, icon, description) VALUES
        ('prod_1', 'កាហ្វេស្រស់', 'Fresh Coffee', 'cat_coffee', 8000, 0, 'fa-coffee', 'កាហ្វេស្រស់ឆ្ងាញ់'),
        ('prod_2', 'កាហ្វេទឹកដោះគោ', 'Coffee with Milk', 'cat_coffee', 10000, 0, 'fa-coffee', 'កាហ្វេទឹកដោះគោផ្អែម'),
        ('prod_3', 'កាហ្វេទឹកក្រឡុក', 'Shaken Coffee', 'cat_coffee', 12000, 10000, 'fa-blender', 'កាហ្វេទឹកក្រឡុកត្រជាក់'),
        ('prod_4', 'កាហ្វេស្រស់ត្រជាក់', 'Iced Fresh Coffee', 'cat_coffee', 9000, 0, 'fa-coffee', 'កាហ្វេស្រស់ត្រជាក់'),
        ('prod_5', 'តែបៃតង', 'Green Tea', 'cat_tea', 7000, 0, 'fa-leaf', 'តែបៃតងក្ដៅ'),
        ('prod_6', 'តែបៃតងទឹកឃ្មុំ', 'Green Tea with Honey', 'cat_tea', 8000, 0, 'fa-leaf', 'តែបៃតងទឹកឃ្មុំ'),
        ('prod_7', 'តែបៃតងទឹកដោះគោ', 'Green Tea with Milk', 'cat_tea', 9000, 0, 'fa-leaf', 'តែបៃតងទឹកដោះគោ'),
        ('prod_8', 'តែបៃតងត្រជាក់', 'Iced Green Tea', 'cat_tea', 7500, 0, 'fa-leaf', 'តែបៃតងត្រជាក់')
    `);
}

// Insert default settings
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
if (settingsCount.count === 0) {
    db.exec(`
        INSERT INTO settings (key, value) VALUES
        ('shopName', 'Coffee POS'),
        ('currency', '៛'),
        ('taxRate', '0')
    `);
}

// Helper functions
function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${random}`;
}

// ============== API ROUTES ==============

// ----- AUTH ROUTES -----
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;

        const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Ensure admin always has all permissions
        let permissions = JSON.parse(user.permissions);
        if (user.role === 'admin') {
            permissions = ['pos', 'items', 'orders', 'reports', 'users'];
        }

        const { password: pwd, permissions: perm, ...userWithoutPassword } = user;
        res.json({ 
            success: true, 
            user: { 
                ...userWithoutPassword, 
                permissions 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- USERS ROUTES -----
app.get('/api/users', (req, res) => {
    try {
        // Only admin can get all users
        const { userId, userRole } = req.query;
        
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'មានតែ Admin ទេដែលអាចមើលអ្នកប្រើប្រាស់ទាំងអស់!' });
        }
        
        const users = db.prepare('SELECT id, username, fullname, role, permissions, createdAt, active FROM users').all();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/users/:id', (req, res) => {
    try {
        const { userRole } = req.query;
        
        // Users can view their own profile, admin can view all
        const user = db.prepare('SELECT id, username, fullname, role, permissions, createdAt, active FROM users WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (userRole !== 'admin' && req.params.id !== userId) {
            return res.status(403).json({ success: false, message: 'អ្នកមិនមានសិទ្ធិមើលអ្នកប្រើប្រាស់នេះទេ!' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/users', (req, res) => {
    try {
        const { username, password, fullname, role, permissions, userId, userRole } = req.body;

        // Only admin can create users
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'មានតែ Admin ទេដែលអាចបង្កើតអ្នកប្រើប្រាស់!' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) {
            return res.status(400).json({ success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ!' });
        }

        // Prevent creating multiple admins
        if (role === 'admin') {
            const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
            if (adminCount.count > 0) {
                return res.status(400).json({ success: false, message: 'មានតែ Admin មួយគត់ដែលអាចមានក្នុងប្រព័ន្ធ!' });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        // Admin always gets all permissions
        const finalPermissions = role === 'admin'
            ? ['pos', 'items', 'orders', 'reports', 'users']
            : (permissions || []);

        db.prepare(`
            INSERT INTO users (id, username, password, fullname, role, permissions, createdAt, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).run(id, username, hashedPassword, fullname, role, JSON.stringify(finalPermissions), createdAt);

        // Broadcast user created event
        broadcast('user-created', {
            id, username, fullname, role, permissions: finalPermissions, createdAt
        });

        res.json({
            success: true,
            message: 'បានបន្ថែមអ្នកប្រើប្រាស់!',
            user: { id, username, fullname, role, permissions: finalPermissions, createdAt }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/users/:id', (req, res) => {
    try {
        const { username, password, fullname, role, permissions, active, userId, userRole } = req.body;
        const { id } = req.params;

        // Only admin can update users
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'មានតែ Admin ទេដែលអាចកែសម្រួលអ្នកប្រើប្រាស់!' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
        if (existing) {
            return res.status(400).json({ success: false, message: 'ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ!' });
        }

        // Prevent creating multiple admins (unless updating existing admin)
        if (role === 'admin') {
            const currentAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' AND id != ?").get(id);
            if (currentAdmin) {
                return res.status(400).json({ success: false, message: 'មិនអាចផ្លាស់ប្តូរជា Admin ទេ ព្រោះមាន Admin រួចហើយ!' });
            }
        }

        // Admin always gets all permissions
        const finalPermissions = role === 'admin' 
            ? ['pos', 'items', 'orders', 'reports', 'users'] 
            : (permissions || []);

        let query;
        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            query = db.prepare(`
                UPDATE users SET username = ?, password = ?, fullname = ?, role = ?, permissions = ?, active = ?
                WHERE id = ?
            `);
            query.run(username, hashedPassword, fullname, role, JSON.stringify(finalPermissions), active ? 1 : 0, id);
        } else {
            query = db.prepare(`
                UPDATE users SET username = ?, fullname = ?, role = ?, permissions = ?, active = ?
                WHERE id = ?
            `);
            query.run(username, fullname, role, JSON.stringify(finalPermissions), active ? 1 : 0, id);
        }

        // Broadcast user updated event
        broadcast('user-updated', { id, username, fullname, role, permissions: finalPermissions, active });

        res.json({ success: true, message: 'បានកែសម្រួលអ្នកប្រើប្រាស់!' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        const { userId, userRole } = req.query;

        // Only admin can delete users
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'មានតែ Admin ទេដែលអាចលុបអ្នកប្រើប្រាស់!' });
        }

        // Prevent admin from deleting themselves
        if (req.params.id === userId) {
            return res.status(400).json({ success: false, message: 'អ្នកមិនអាចលុបគណនីខ្លួនឯងទេ!' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        
        // Broadcast user deleted event
        broadcast('user-deleted', { id: req.params.id });
        
        res.json({ success: true, message: 'បានលុបអ្នកប្រើប្រាស់!' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- CATEGORIES ROUTES -----
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories').all();
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const { name, name_km, icon } = req.body;
        const id = uuidv4();
        
        db.prepare('INSERT INTO categories (id, name, name_km, icon) VALUES (?, ?, ?, ?)')
            .run(id, name, name_km, icon || 'fa-box');
        
        res.json({ success: true, message: 'Category created successfully', category: { id, name, name_km, icon } });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- PRODUCTS ROUTES -----
app.get('/api/products', (req, res) => {
    try {
        const { category, search, active } = req.query;
        
        let query = `
            SELECT p.*, c.name as category_name, c.name_km as category_name_km
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category && category !== 'all') {
            query += ' AND p.category_id = ?';
            params.push(category);
        }
        
        if (search) {
            query += ' AND (p.name LIKE ? OR p.name_km LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (active !== undefined) {
            query += ' AND p.active = ?';
            params.push(active ? 1 : 0);
        }
        
        query += ' ORDER BY p.name';
        
        const products = db.prepare(query).all(...params);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.prepare(`
            SELECT p.*, c.name as category_name, c.name_km as category_name_km
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `).get(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const { name, name_km, category_id, price, salePrice, image, icon, description, active } = req.body;
        const id = uuidv4();

        db.prepare(`
            INSERT INTO products (id, name, name_km, category_id, price, salePrice, image, icon, description, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, name_km || name, category_id, price, salePrice || 0, image, icon || 'fa-box', description, active ? 1 : 0);

        // Broadcast product created event
        broadcast('product-created', { id, name, name_km, category_id, price, salePrice, image, icon, description, active });

        res.json({ success: true, message: 'Product created successfully', product: { id, name, name_km, category_id, price, salePrice, image, icon, description, active } });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/products/:id', (req, res) => {
    try {
        const { name, name_km, category_id, price, salePrice, image, icon, description, active } = req.body;

        db.prepare(`
            UPDATE products
            SET name = ?, name_km = ?, category_id = ?, price = ?, salePrice = ?, image = ?, icon = ?, description = ?, active = ?
            WHERE id = ?
        `).run(name, name_km || name, category_id, price, salePrice || 0, image, icon, description, active ? 1 : 0, req.params.id);

        // Broadcast product updated event
        broadcast('product-updated', { id: req.params.id, name, name_km, category_id, price, salePrice, image, icon, description, active });

        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        
        // Broadcast product deleted event
        broadcast('product-deleted', { id: req.params.id });
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- ORDERS ROUTES -----
app.get('/api/orders', (req, res) => {
    try {
        const { date, userId, startDate, endDate } = req.query;
        
        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];
        
        if (date) {
            query += ' AND DATE(date) = ?';
            params.push(date);
        }
        
        if (startDate) {
            query += ' AND DATE(date) >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND DATE(date) <= ?';
            params.push(endDate);
        }
        
        if (userId) {
            query += ' AND userId = ?';
            params.push(userId);
        }
        
        query += ' ORDER BY date DESC';
        
        const orders = db.prepare(query).all(...params);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/orders/:id', (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/orders', (req, res) => {
    try {
        const { items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName } = req.body;

        const id = uuidv4();
        const receiptNumber = generateReceiptNumber();
        const date = new Date().toISOString();

        db.prepare(`
            INSERT INTO orders (id, receiptNumber, date, items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, receiptNumber, date, JSON.stringify(items), subtotal, discountPercent || 0, discountAmount || 0, total, paymentMethod || 'cash', userId, userName);

        // Broadcast new order event
        broadcast('order-created', {
            id, receiptNumber, date, items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName
        });

        res.json({
            success: true,
            message: 'Order created successfully',
            order: { id, receiptNumber, date, items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
        
        // Broadcast order deleted event
        broadcast('order-deleted', { id: req.params.id });
        
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- REPORTS/STATS ROUTES -----
app.get('/api/reports/summary', (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = '';
        const params = [];
        
        if (startDate && endDate) {
            dateFilter = ' AND DATE(date) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        
        const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE 1=1${dateFilter}`).get(...params);
        const totalOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE 1=1${dateFilter}`).get(...params);
        const totalDiscount = db.prepare(`SELECT COALESCE(SUM(discountAmount), 0) as total FROM orders WHERE 1=1${dateFilter}`).get(...params);
        
        // Get top product
        const topProductQuery = `
            SELECT json_extract(value, '$.name') as name, SUM(json_extract(value, '$.quantity')) as qty
            FROM orders, json_each(items)
            WHERE 1=1${dateFilter}
            GROUP BY name
            ORDER BY qty DESC
            LIMIT 1
        `;
        const topProduct = db.prepare(topProductQuery).get(...params);
        
        res.json({
            success: true,
            stats: {
                totalRevenue: totalRevenue.total,
                totalOrders: totalOrders.count,
                totalDiscount: totalDiscount.total,
                topProduct: topProduct ? topProduct.name : null,
                avgOrderValue: totalOrders.count > 0 ? totalRevenue.total / totalOrders.count : 0
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ----- SETTINGS ROUTES -----
app.get('/api/settings', (req, res) => {
    try {
        const settings = db.prepare('SELECT key, value FROM settings').all();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json({ success: true, settings: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/settings', (req, res) => {
    try {
        const { settings } = req.body;
        
        const upsert = db.prepare(`
            INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = ?
        `);
        
        for (const [key, value] of Object.entries(settings)) {
            upsert.run(key, String(value), String(value));
        }
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============== SOCKET.IO REAL-TIME SYNC ==============

// Track connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // User login - register socket
    socket.on('user-login', (userData) => {
        connectedUsers.set(socket.id, {
            id: userData.id,
            username: userData.username,
            role: userData.role,
            fullname: userData.fullname
        });
        socket.userData = userData;
        
        // Broadcast user online status
        io.emit('user-status', {
            type: 'online',
            userId: userData.id,
            username: userData.username,
            fullname: userData.fullname,
            onlineCount: connectedUsers.size
        });
        
        console.log(`👤 User logged in: ${userData.username} (${socket.id})`);
    });

    // Handle user logout
    socket.on('user-logout', () => {
        if (socket.userData) {
            connectedUsers.delete(socket.id);
            
            io.emit('user-status', {
                type: 'offline',
                userId: socket.userData.id,
                username: socket.userData.username,
                onlineCount: connectedUsers.size
            });
            
            console.log(`👤 User logged out: ${socket.userData.username}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.userData) {
            connectedUsers.delete(socket.id);
            
            io.emit('user-status', {
                type: 'offline',
                userId: socket.userData.id,
                username: socket.userData.username,
                onlineCount: connectedUsers.size
            });
        }
        console.log('🔌 Client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Helper function to broadcast events
function broadcast(eventType, data) {
    io.emit(eventType, {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString()
    });
}

// Export broadcast function for use in routes
module.exports.broadcast = broadcast;

// Start server
server.listen(PORT, () => {
    console.log(`\n☕ Coffee POS API Server running on http://localhost:${PORT}`);
    console.log(`📊 SQLite Database: coffee_pos.db`);
    console.log(`🔌 Real-time Sync: Enabled (Socket.io)`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  POST   /api/auth/login`);
    console.log(`  GET    /api/users`);
    console.log(`  POST   /api/users`);
    console.log(`  PUT    /api/users/:id`);
    console.log(`  DELETE /api/users/:id`);
    console.log(`  GET    /api/categories`);
    console.log(`  POST   /api/categories`);
    console.log(`  GET    /api/products`);
    console.log(`  POST   /api/products`);
    console.log(`  PUT    /api/products/:id`);
    console.log(`  DELETE /api/products/:id`);
    console.log(`  GET    /api/orders`);
    console.log(`  POST   /api/orders`);
    console.log(`  DELETE /api/orders/:id`);
    console.log(`  GET    /api/reports/summary`);
    console.log(`  GET    /api/settings`);
    console.log(`  PUT    /api/settings\n`);
});
