// Authentication Middleware
class AuthMiddleware {
    // Optional: Add JWT or session-based authentication here
    // For now, we're using the client-side authentication pattern
    // This middleware can be extended to validate tokens
    
    authenticate(req, res, next) {
        // If you want to add token-based authentication, implement it here
        // For now, we'll allow all requests through and let the frontend handle auth
        next();
    }

    // Check if user has required permissions
    requirePermission(permission) {
        return (req, res, next) => {
            const { userRole, permissions } = req.query;
            
            if (!userRole && !permissions) {
                // Allow request to continue if no user context provided
                return next();
            }

            const userPermissions = permissions ? JSON.parse(permissions) : [];
            const isAdmin = userRole === 'admin';

            if (!isAdmin && !userPermissions.includes(permission)) {
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
        const { userRole } = req.query;

        if (userRole && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'មានតែ Admin ទេដែលអាចចូលប្រើប្រាស់ផ្នែកនេះ!'
            });
        }

        next();
    }
}

module.exports = new AuthMiddleware();
