// Auth Controller
const userModel = require('../models/User');

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username and password are required' 
                });
            }

            // Find user
            const user = userModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            // Check if user is active
            if (!user.active) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User account is inactive' 
                });
            }

            // Verify password
            const isValidPassword = userModel.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid password' 
                });
            }

            // Sanitize user data (remove password)
            const sanitizedUser = userModel.sanitizeUser(user);

            res.json({
                success: true,
                message: 'Login successful',
                user: sanitizedUser
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getProfile(req, res) {
        try {
            const user = userModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            const sanitizedUser = userModel.sanitizeUser(user);
            res.json({
                success: true,
                user: sanitizedUser
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new AuthController();
