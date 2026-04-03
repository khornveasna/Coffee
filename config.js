// Coffee POS System - Production Configuration
const path = require('path');

// Load environment variables if dotenv is available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, use process.env
}

const config = {
    // Server
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'production',
    
    // Database
    database: {
        path: process.env.DATABASE_PATH || path.join(__dirname, 'coffee_pos.db'),
        backup: {
            enabled: process.env.BACKUP_ENABLED === 'true',
            intervalHours: parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24,
            directory: process.env.BACKUP_DIR || path.join(__dirname, 'backups')
        }
    },
    
    // Security
    security: {
        sessionSecret: process.env.SESSION_SECRET || 'coffee-pos-secret-change-in-production',
        corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
        }
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: path.join(__dirname, 'logs')
    },
    
    // SSL (optional)
    ssl: {
        enabled: process.env.SSL_ENABLED === 'true',
        keyPath: process.env.SSL_KEY_PATH,
        certPath: process.env.SSL_CERT_PATH
    },
    
    // Application
    app: {
        name: 'Coffee POS System',
        version: '1.0.0',
        description: 'Coffee Shop Point of Sale System'
    }
};

// Validate production configuration
function validateConfig() {
    const errors = [];
    
    if (config.nodeEnv === 'production') {
        if (config.security.sessionSecret === 'coffee-pos-secret-change-in-production') {
            errors.push('SESSION_SECRET must be changed in production environment');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Log configuration (non-sensitive)
function logConfig() {
    console.log('='.repeat(50));
    console.log('☕ Coffee POS System - Configuration');
    console.log('='.repeat(50));
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${config.port}`);
    console.log(`Database: ${config.database.path}`);
    console.log(`Log Level: ${config.logging.level}`);
    console.log(`SSL Enabled: ${config.ssl.enabled}`);
    console.log(`CORS Origins: ${config.security.corsOrigins}`);
    console.log('='.repeat(50));
    
    const validation = validateConfig();
    if (!validation.isValid) {
        console.warn('\n⚠️  Configuration Warnings:');
        validation.errors.forEach(err => console.warn(`   - ${err}`));
        console.warn('');
    }
}

module.exports = {
    config,
    validateConfig,
    logConfig
};
