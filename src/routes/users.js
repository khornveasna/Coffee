<<<<<<< HEAD
// User Routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const socketService = require('../services/socket');

// Middleware to attach broadcast function to request
router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

// GET /api/users - Get all users (admin only)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get specific user
router.get('/:id', userController.getUser);

// POST /api/users - Create new user (admin only)
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
=======
const express = require('express');
const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

module.exports = function usersRoutes(db, broadcast) {
    const router = express.Router();

    // GET all users (admin only)
    router.get('/', authMiddleware.authenticate, authMiddleware.requireAdmin, (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const total = db.prepare('SELECT COUNT(*) as count FROM users').get();
            const users = db.prepare(
                'SELECT id, username, fullname, role, permissions, createdAt, active FROM users LIMIT ? OFFSET ?'
            ).all(limit, offset);

            res.json({ 
                success: true, 
                users,
                pagination: {
                    page,
                    limit,
                    total: total.count,
                    totalPages: Math.ceil(total.count / limit)
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // GET single user
    router.get('/:id', authMiddleware.authenticate, (req, res) => {
        try {
            // Users can view their own profile, admins can view any user
            if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'អ្នកមិនមានសិទ្ធិមើលអ្នកប្រើប្រាស់នេះទេ!' 
                });
            }

            const user = db.prepare(
                'SELECT id, username, fullname, role, permissions, createdAt, active FROM users WHERE id = ?'
            ).get(req.params.id);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            res.json({ success: true, user });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // Validation rules
    const validateUser = [
        body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
        body('fullname').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
        body('role').isIn(['admin', 'manager', 'staff']).withMessage('Invalid role'),
        body('password').optional({ nullable: true }).isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
        body('active').optional().isBoolean().toBoolean()
    ];

    // POST create user (admin only)
    router.post('/', 
        authMiddleware.authenticate, 
        authMiddleware.requireAdmin,
        validateUser,
        (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }

            const { username, password, fullname, role, permissions } = req.body;

            if (!password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password is required' 
                });
            }

            const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ!' 
                });
            }

            if (role === 'admin') {
                const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
                if (adminCount.count > 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'មានតែ Admin មួយគត់ដែលអាចមានក្នុងប្រព័ន្ធ!' 
                    });
                }
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const id = uuidv4();
            const createdAt = new Date().toISOString();
            const finalPermissions = role === 'admin'
                ? ['pos', 'items', 'orders', 'reports', 'users']
                : (permissions || []);

            db.prepare(`
                INSERT INTO users (id, username, password, fullname, role, permissions, createdAt, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `).run(id, username, hashedPassword, fullname, role, JSON.stringify(finalPermissions), createdAt);

            broadcast('user-created', { id, username, fullname, role, permissions: finalPermissions, createdAt });
            res.status(201).json({ 
                success: true, 
                message: 'បានបន្ថែមអ្នកប្រើប្រាស់!', 
                user: { id, username, fullname, role, permissions: finalPermissions, createdAt } 
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // PUT update user (admin only)
    router.put('/:id', 
        authMiddleware.authenticate, 
        authMiddleware.requireAdmin,
        validateUser,
        (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }

            const { username, password, fullname, role, permissions, active } = req.body;
            const { id } = req.params;

            const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ!' 
                });
            }

            if (role === 'admin') {
                const currentAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' AND id != ?").get(id);
                if (currentAdmin) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'មិនអាចផ្លាស់ប្តូរជា Admin ទេ ព្រោះមាន Admin រួចហើយ!' 
                    });
                }
            }

            const finalPermissions = role === 'admin'
                ? ['pos', 'items', 'orders', 'reports', 'users']
                : (permissions || []);

            if (password) {
                const hashedPassword = bcrypt.hashSync(password, 10);
                db.prepare('UPDATE users SET username=?, password=?, fullname=?, role=?, permissions=?, active=? WHERE id=?')
                    .run(username, hashedPassword, fullname, role, JSON.stringify(finalPermissions), active ? 1 : 0, id);
            } else {
                db.prepare('UPDATE users SET username=?, fullname=?, role=?, permissions=?, active=? WHERE id=?')
                    .run(username, fullname, role, JSON.stringify(finalPermissions), active ? 1 : 0, id);
            }

            broadcast('user-updated', { id, username, fullname, role, permissions: finalPermissions, active });
            res.json({ 
                success: true, 
                message: 'បានកែសម្រួលអ្នកប្រើប្រាស់!' 
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // DELETE user (admin only)
    router.delete('/:id', authMiddleware.authenticate, authMiddleware.requireAdmin, (req, res) => {
        try {
            if (req.params.id === req.user.id) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'អ្នកមិនអាចលុបគណនីខ្លួនឯងទេ!' 
                });
            }

            db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
            broadcast('user-deleted', { id: req.params.id });
            res.json({ 
                success: true, 
                message: 'បានលុបអ្នកប្រើប្រាស់!' 
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
>>>>>>> acbaef74e4deb37ef63c984d184b45dcbd99c93d
