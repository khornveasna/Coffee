// Coffee POS System - Database Backup Script
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'coffee_pos.db');
const backupDir = path.join(__dirname, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFileName = `coffee_pos-backup-${timestamp}.db`;

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('Created backups directory');
}

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error('ERROR: Database file not found:', dbPath);
    process.exit(1);
}

// Copy database to backup location
try {
    fs.copyFileSync(dbPath, path.join(backupDir, backupFileName));
    console.log('✓ Database backup created successfully!');
    console.log(`  Source: ${dbPath}`);
    console.log(`  Backup: ${path.join(backupDir, backupFileName)}`);
    
    // Get file size
    const stats = fs.statSync(path.join(backupDir, backupFileName));
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  Size: ${fileSizeInMB} MB`);
    
    // Clean up old backups (keep last 10)
    const backupFiles = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('coffee_pos-backup-') && f.endsWith('.db'))
        .sort()
        .reverse();
    
    if (backupFiles.length > 10) {
        console.log('\nCleaning up old backups...');
        const filesToDelete = backupFiles.slice(10);
        filesToDelete.forEach(file => {
            const filePath = path.join(backupDir, file);
            fs.unlinkSync(filePath);
            console.log(`  Deleted: ${file}`);
        });
        console.log(`  Kept ${Math.min(10, backupFiles.length)} most recent backups`);
    }
    
    console.log('\nBackup completed successfully!');
} catch (error) {
    console.error('ERROR: Failed to create backup:', error.message);
    process.exit(1);
}
