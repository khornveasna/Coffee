// Database Migration Script - Update existing database with new schema
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('coffee_pos.db');

console.log('🔄 Starting database migration...\n');

try {
    // Check if users table needs active column
    const tableInfo = db.pragma("table_info('users')");
    const hasActiveColumn = tableInfo.some(col => col.name === 'active');

    if (!hasActiveColumn) {
        console.log('➕ Adding "active" column to users table...');
        db.exec('ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1');
        console.log('✅ Column added successfully!\n');
    } else {
        console.log('✓ "active" column already exists\n');
    }

    // Check if we need to update default users
    const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();

    if (adminUser) {
        console.log('📝 Updating admin user permissions...');
        db.prepare("UPDATE users SET permissions = ?, active = 1 WHERE username = 'admin'")
            .run(JSON.stringify(['pos', 'items', 'orders', 'reports', 'users']));
        console.log('✅ Admin permissions updated!\n');
    }

    if (adminUser) {
        console.log('📝 Updating manager user permissions...');
        db.prepare("UPDATE users SET permissions = ?, active = 1 WHERE username = 'manager'")
            .run(JSON.stringify(['pos', 'items', 'orders', 'reports']));
        console.log('✅ Manager permissions updated!\n');
    }

    const staffUser = db.prepare("SELECT * FROM users WHERE username = 'staff'").get();
    if (staffUser) {
        console.log('📝 Updating staff user permissions...');
        db.prepare("UPDATE users SET permissions = ?, active = 1 WHERE username = 'staff'")
            .run(JSON.stringify(['pos', 'orders']));
        console.log('✅ Staff permissions updated!\n');
    }

    // Verify all users have active column set
    console.log('✓ Ensuring all users are active...');
    db.exec('UPDATE users SET active = 1 WHERE active IS NULL');
    console.log('✅ All users marked as active!\n');

    // Show current users
    console.log('📊 Current Users:');
    console.log('─'.repeat(60));
    const users = db.prepare('SELECT username, fullname, role, permissions, active FROM users').all();
    users.forEach(user => {
        const perms = JSON.parse(user.permissions);
        console.log(`  ${user.username} (${user.fullname})`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Permissions: ${perms.join(', ')}`);
        console.log(`    Active: ${user.active ? 'Yes' : 'No'}`);
        console.log('');
    });

    console.log('✅ Migration completed successfully!\n');

} catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
} finally {
    db.close();
}
