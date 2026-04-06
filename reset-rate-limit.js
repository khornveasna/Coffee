// Temporary script to reset rate limiter by restarting the server
const { execSync } = require('child_process');

console.log('Stopping server...');
try {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
} catch (e) {
    // Ignore errors if no node process is running
}

console.log('Waiting 2 seconds...');
setTimeout(() => {
    console.log('Starting server...');
    execSync('npm start', { stdio: 'inherit' });
}, 2000);
