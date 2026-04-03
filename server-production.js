// Coffee POS System - Production Server Wrapper
// This file adds production-ready features to the main server

const path = require('path');
const fs = require('fs');

// Load environment variables
try {
    const dotenvPath = path.join(__dirname, '.env');
    if (fs.existsSync(dotenvPath)) {
        require('dotenv').config({ path: dotenvPath });
    }
} catch (e) {
    // dotenv not available, continue without it
}

// Set production environment if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Import main server
const app = require('./server');

// Add security and production middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security: Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for compatibility
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'production'
    };
    
    res.status(200).json({ success: true, health });
});

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Close database connections
    if (global.db) {
        console.log('Closing database connections...');
        // Database will be closed when server shuts down
    }
    
    // Close HTTP server
    if (global.server) {
        global.server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('\n🚀 Production mode enabled');
console.log('🔒 Security headers enabled (Helmet)');
console.log('⚡ Rate limiting enabled');
console.log('🏥 Health check endpoint: /api/health\n');

// Export the enhanced app
module.exports = app;
