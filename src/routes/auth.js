const express = require('express');
const bcrypt  = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

module.exports = function authRoutes(db) {
    const router = express.Router();

    router.post('/login', (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username and password are required' 
                });
            }

            const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);
            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }

            let permissions = JSON.parse(user.permissions);
            if (user.role === 'admin') {
                permissions = ['pos', 'items', 'orders', 'reports', 'users'];
            }

            // Generate JWT token
            const token = authMiddleware.generateToken(user);

            const { password: _pwd, ...userWithoutPassword } = user;
            res.json({ 
                success: true, 
                token,
                user: { ...userWithoutPassword, permissions } 
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
