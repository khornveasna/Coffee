const express = require('express');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

module.exports = function settingsRoutes(db) {
    const router = express.Router();

    router.get('/', authMiddleware.authenticate, (req, res) => {
        try {
            const rows = db.prepare('SELECT key, value FROM settings').all();
            const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
            res.json({ success: true, settings });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    router.put('/', authMiddleware.authenticate, authMiddleware.requireAdmin, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { settings } = req.body;
            
            if (!settings || typeof settings !== 'object') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Settings must be an object' 
                });
            }

            // Validate tax rate
            if (settings.taxRate !== undefined) {
                const taxRate = parseFloat(settings.taxRate);
                if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Tax rate must be a number between 0 and 100' 
                    });
                }
            }

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

    return router;
};
