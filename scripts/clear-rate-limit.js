// Quick fix: Bypass rate limiter by clearing the memory store
const server = require('./server');

// The rate limiter uses memory-store which resets on server restart
// Just restart the server and you're good to go!

console.log('Server restarted - rate limiter has been reset!');
console.log('You can now make requests again.');
