// Error Handler Middleware
class ErrorHandler {
    // 404 Not Found Handler
    notFoundHandler(req, res, next) {
        res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        });
    }

    // Global Error Handler
    errorHandler(err, req, res, next) {
        // Log error for debugging
        console.error('Error:', err);

        // Default error status and message
        let statusCode = err.statusCode || 500;
        let message = err.message || 'Internal server error';

        // Handle specific error types
        if (err.name === 'ValidationError') {
            statusCode = 400;
            message = err.message;
        }

        if (err.name === 'UnauthorizedError') {
            statusCode = 401;
            message = 'Unauthorized access';
        }

        if (err.name === 'ForbiddenError') {
            statusCode = 403;
            message = 'Forbidden access';
        }

        // Don't expose internal errors in production
        if (process.env.NODE_ENV === 'production' && statusCode === 500) {
            message = 'Something went wrong';
        }

        res.status(statusCode).json({
            success: false,
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Async error wrapper
    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

module.exports = new ErrorHandler();
