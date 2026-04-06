// Settings Controller
const databaseService = require('../services/database');

class SettingsController {
    async getSettings(req, res) {
        try {
            const db = databaseService.getDatabase();
            const settings = db.prepare('SELECT key, value FROM settings').all();
            const settingsObj = {};
            settings.forEach(s => {
                settingsObj[s.key] = s.value;
            });

            res.json({ 
                success: true, 
                settings: settingsObj 
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async updateSettings(req, res) {
        try {
            const db = databaseService.getDatabase();
            const { settings } = req.body;

            if (!settings || typeof settings !== 'object') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Settings object is required' 
                });
            }

            const upsert = db.prepare(`
                INSERT INTO settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = ?
            `);

            for (const [key, value] of Object.entries(settings)) {
                upsert.run(key, String(value), String(value));
            }

            res.json({ 
                success: true, 
                message: 'Settings updated successfully' 
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new SettingsController();
