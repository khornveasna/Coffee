// Authentication Middleware with JWT
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

class AuthMiddleware {
    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: JSON.parse(user.permissions)
            },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }

    // Verify and authenticate JWT token
    authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }

            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Attach user info to request
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    }

    // Check if user has required permissions
    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            const isAdmin = req.user.role === 'admin';
            const hasPermission = isAdmin || req.user.permissions.includes(permission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ផ្នែកនេះទេ!'
                });
            }

            next();
        };
    }

    // Check if user is admin
    requireAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'មានតែ Admin ទេដែលអាចចូលប្រើប្រាស់ផ្នែកនេះ!'
            });
        }

        next();
    }
}

module.exports = new AuthMiddleware();
