// Coffee POS System - Server entry point
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan  = require('morgan');
const http    = require('http');
const path    = require('path');
const fs      = require('fs');

const db                         = require('./src/db');
const { initSocket, broadcast }  = require('./src/socket');
const errorHandler               = require('./src/middleware/errorHandler');

const app    = express();
const PORT   = process.env.PORT || 3000;
const server = http.createServer(app);

// Real-time sync
initSocket(server);

// ── Security Middleware ──────────────────────────────────────────────────────

// Determine if we're in development mode
// Check both environment variable and if we're running on localhost
const isDevelopment = process.env.NODE_ENV !== 'production' || 
                      process.argv.includes('--dev') ||
                      !process.env.PRODUCTION_MODE;

// Helmet for security headers (relaxed CSP in development for easier debugging)
app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',') 
        : true, // Allow all in development
    credentials: true,
    maxAge: 600
};
app.use(cors(corsOptions));

// Rate limiting (disabled in development for easier testing)
const rateLimitConfig = isDevelopment 
    ? { windowMs: 60 * 1000, max: 10000 }  // Very high limit in dev
    : {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
      };

const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: (req, res) => isDevelopment
});

// Apply rate limiter to all requests
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    }
});

// ── Logging ──────────────────────────────────────────────────────────────────

// Morgan HTTP logging
if (process.env.NODE_ENV === 'production' || process.env.LOG_LEVEL === 'info') {
    // Create log directory if it doesn't exist
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const accessLogStream = fs.createWriteStream(
        path.join(logDir, 'access.log'), 
        { flags: 'a' }
    );
    
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    // Dev format for development
    app.use(morgan('dev'));
}

// ── Core Middleware ──────────────────────────────────────────────────────────

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check Endpoint ────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
    try {
        const dbTest = db.prepare('SELECT 1 as test').get();
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: dbTest?.test === 1 ? 'connected' : 'disconnected',
            version: require('./package.json').version
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            message: error.message
        });
    }
});

// ── API Routes (v1) ──────────────────────────────────────────────────────────

app.use('/api/v1/auth',       authLimiter, require('./src/routes/auth')(db));
app.use('/api/v1/users',      require('./src/routes/users')(db, broadcast));
app.use('/api/v1/categories', require('./src/routes/categories')(db));
app.use('/api/v1/products',   require('./src/routes/products')(db, broadcast));
app.use('/api/v1/orders',     require('./src/routes/orders')(db, broadcast));
app.use('/api/v1/reports',    require('./src/routes/reports')(db));
app.use('/api/v1/settings',   require('./src/routes/settings')(db));

// Backwards compatibility - legacy routes (deprecated, will redirect to v1)
app.use('/api/auth',       authLimiter, require('./src/routes/auth')(db));
app.use('/api/users',      require('./src/routes/users')(db, broadcast));
app.use('/api/categories', require('./src/routes/categories')(db));
app.use('/api/products',   require('./src/routes/products')(db, broadcast));
app.use('/api/orders',     require('./src/routes/orders')(db, broadcast));
app.use('/api/reports',    require('./src/routes/reports')(db));
app.use('/api/settings',   require('./src/routes/settings')(db));

// ── 404 Handler ──────────────────────────────────────────────────────────────

app.use(errorHandler.notFoundHandler);

// ── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler.errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────

server.listen(PORT, () => {
    console.log('');
    console.log('☕ Coffee POS running on http://localhost:' + PORT);
    console.log('📊 Database: coffee_pos.db');
    console.log('🔌 Real-time: Socket.io enabled');
    console.log('🔒 Security: Helmet, CORS, Rate Limiting enabled');
    console.log('📝 Logging: Morgan HTTP logger active');
    console.log('🏥 Health: http://localhost:' + PORT + '/api/health');
    console.log('📦 API Version: v1');
    console.log('');
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────

function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('HTTP server closed.');
        
        try {
            db.close();
            console.log('Database connection closed.');
        } catch (error) {
            console.error('Error closing database:', error);
        }
        
        console.log('Graceful shutdown completed.');
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

module.exports = app;
