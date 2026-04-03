# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Security Configuration
- [ ] Create `.env` file from `.env.example`
- [ ] Generate and set `SESSION_SECRET` (run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Review and update all environment variables
- [ ] Change default admin password after first login
- [ ] Verify `.env` is in `.gitignore`

### 2. Dependencies
- [ ] Run `npm install --production`
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Update packages to latest stable versions
- [ ] Remove development dependencies if not needed

### 3. Database
- [ ] Run database migrations: `node migrate-db.js`
- [ ] Verify database file exists and is accessible
- [ ] Set proper file permissions for database
- [ ] Configure automatic backups (see backup scripts)
- [ ] Test backup and restore process

### 4. Server Configuration
- [ ] Update `package.json` with your repository URL
- [ ] Set correct PORT in `.env` or environment
- [ ] Configure CORS origins if needed
- [ ] Enable rate limiting (already configured)
- [ ] Set up SSL/HTTPS if required

### 5. File Permissions
- [ ] IIS_IUSRS has Read/Write access to app folder
- [ ] IIS_IUSRS has Write access to database file
- [ ] Logs directory is writable
- [ ] Backups directory is writable

### 6. Logging
- [ ] Create `logs` directory
- [ ] Configure log rotation
- [ ] Set appropriate log level
- [ ] Test log file creation

### 7. Monitoring
- [ ] Test health endpoint: `http://localhost:3000/api/health`
- [ ] Set up uptime monitoring
- [ ] Configure error notifications
- [ ] Set up performance monitoring

### 8. Backup Strategy
- [ ] Test manual backup: `npm run backup-db`
- [ ] Schedule automatic backups (Windows Task Scheduler)
- [ ] Verify backup restoration process
- [ ] Store backups in separate location/drive

### 9. Performance
- [ ] Enable compression (gzip)
- [ ] Configure static file caching
- [ ] Optimize database queries
- [ ] Set appropriate connection limits

### 10. Testing
- [ ] Test all CRUD operations
- [ ] Test user authentication
- [ ] Test permission system
- [ ] Test real-time sync (Socket.io)
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Load test with multiple users

## Deployment Steps

### For IIS Deployment:
1. [ ] Run `deploy-iis.ps1` as Administrator
2. [ ] Verify site is accessible
3. [ ] Test all functionality
4. [ ] Configure SSL certificate
5. [ ] Update DNS records if needed
6. [ ] Configure firewall rules

### For Direct Node.js Deployment:
1. [ ] Copy all files to server
2. [ ] Run `npm install --production`
3. [ ] Create and configure `.env`
4. [ ] Start server: `npm start` or `node server.js`
5. [ ] Verify server is running
6. [ ] Set up process manager (PM2 recommended)
7. [ ] Configure auto-start on boot

## Post-Deployment Checklist

### Immediate Tasks
- [ ] Verify application loads correctly
- [ ] Login with default credentials
- [ ] Change default admin password
- [ ] Create at least one test order
- [ ] Verify database is saving data
- [ ] Test real-time features

### Security
- [ ] Change all default passwords
- [ ] Verify HTTPS is working (if configured)
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Verify file permissions
- [ ] Review access logs

### Monitoring
- [ ] Check health endpoint
- [ ] Monitor error logs
- [ ] Check memory usage
- [ ] Monitor database size
- [ ] Set up alerts for downtime

### Documentation
- [ ] Document server credentials
- [ ] Record deployment date
- [ ] Note any custom configurations
- [ ] Create runbook for common issues
- [ ] Document backup schedule

## Maintenance Schedule

### Daily
- [ ] Check application logs
- [ ] Verify backups completed
- [ ] Monitor disk space

### Weekly
- [ ] Review error logs
- [ ] Check database size
- [ ] Test backup restoration
- [ ] Review user activity

### Monthly
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Clean up old logs
- [ ] Archive old backups
- [ ] Performance review

### Quarterly
- [ ] Full security audit
- [ ] Database optimization
- [ ] Review and update documentation
- [ ] Test disaster recovery
- [ ] Review user permissions

## Rollback Plan

If deployment fails:
1. Stop the application
2. Restore previous version from backup
3. Restore database from backup
4. Verify application works
5. Document what went wrong
6. Plan retry with fixes

## Emergency Contacts

- **Server Admin**: _________________
- **Database Admin**: _________________
- **Developer**: _________________
- **Support Email**: _________________

## Quick Commands Reference

```bash
# Start server
npm start

# Backup database
npm run backup-db

# Check health
curl http://localhost:3000/api/health

# View logs
tail -f logs/*.log

# Restart (IIS)
iisreset /restart

# Restart (PM2)
pm2 restart coffee-pos

# Check status
appcmd list site /name:"Coffee POS System"
```

## Notes

Add any custom configurations or notes here:
- 
- 
- 

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Version**: 1.0.0
**Server**: _________________
