# Migration Guide - Coffee POS System v1.0

## Overview
This guide helps you migrate from the old Coffee POS system to the new secured version with JWT authentication, input validation, and other improvements.

## Breaking Changes

### 1. Authentication Now Required
**Before:** API routes were accessible without authentication (relying on client-side checks)
**After:** All API routes require JWT tokens in the Authorization header

**Migration:**
```javascript
// Old way (no auth)
fetch('/api/products')

// New way (with JWT token)
const token = localStorage.getItem('coffeePOSToken');
fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 2. Login Response Now Includes Token
**Before:** Login returned only user object
**After:** Login returns user object AND JWT token

**Migration:**
```javascript
// Old response
{ success: true, user: {...} }

// New response
{ success: true, token: 'eyJ...', user: {...} }

// Store the token
localStorage.setItem('coffeePOSToken', result.token);
```

### 3. Authorization No Longer Uses Query Parameters
**Before:** Client sent `userRole` and `userId` as query params
**After:** Server extracts user info from JWT token automatically

**Migration:**
```javascript
// Old way (insecure)
fetch('/api/users?userRole=admin&userId=123')

// New way (secure - token contains user info)
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 4. Pagination Added to List Endpoints
**Before:** All records returned in single request
**After:** Paginated responses (default: 50 items per page)

**Migration:**
```javascript
// Old response
{ success: true, products: [...] }

// New response
{ 
  success: true, 
  products: [...],
  pagination: {
    page: 1,
    limit: 50,
    total: 150,
    totalPages: 3
  }
}

// To get all items, loop through pages
for (let page = 1; page <= totalPages; page++) {
  fetch(`/api/products?page=${page}&limit=50`)
}
```

### 5. API Versioning
**Before:** Routes at `/api/*`
**After:** Both `/api/v1/*` and `/api/*` work (legacy routes maintained for backward compatibility)

**Recommendation:** Use `/api/v1/*` for new integrations

### 6. Input Validation Added
**Before:** Any data accepted
**After:** Strict validation on all POST/PUT requests

**Examples:**
```javascript
// This will now fail validation
POST /api/users
{
  username: "ab",  // Too short (min 3 chars)
  password: "1234",
  fullname: "T",   // Too short (min 2 chars)
  role: "staff"
}

// This will now fail validation
POST /api/products
{
  name: "Coffee",
  price: -10  // Must be positive
}
```

### 7. HTTP Status Codes Changed
**Before:** Most successes returned 200
**After:** Proper HTTP status codes

- `201 Created` - Successful resource creation
- `200 OK` - Successful GET/UPDATE/DELETE
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server errors

### 8. Password Field Changes
**Before:** Password required for all user updates
**After:** Password optional for user updates (only include if changing)

```javascript
// Update user without changing password
PUT /api/users/:id
{
  username: "newname",
  fullname: "New Name",
  role: "manager"
  // No password = keep existing password
}

// Update user with new password
PUT /api/users/:id
{
  username: "newname",
  fullname: "New Name",
  role: "manager",
  password: "newpass123"  // Will hash and update
}
```

## Frontend Changes

### Updated Files
- `public/js/auth.js` - Added JWT token handling and `apiRequest` helper
- `public/js/data.js` - No changes needed (backward compatible)

### Using the New apiRequest Helper
```javascript
// Instead of fetch, use the built-in helper
const result = await pos.apiRequest('/api/products');

// With options
const result = await pos.apiRequest('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
});
```

## Environment Variables

### New Required Variables
Create a `.env` file (copy from `.env.example`):

```env
# Required
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-secret-key-change-in-production

# Optional (with defaults)
PORT=3000
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

### Generate Secure Secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Testing

### Run Tests
```bash
npm test
```

This tests:
- Health endpoint
- Authentication (login, token generation)
- Protected routes (with and without auth)
- Input validation
- Pagination
- API versioning
- Error handling

## Database Changes

### No Schema Changes
The database schema remains the same. Your existing data is safe.

### What Changed
- Order creation now uses transactions (more reliable)
- User IDs now use UUID instead of custom format

## Security Checklist

After migration:

- [ ] Generate and set `JWT_SECRET`
- [ ] Generate and set `SESSION_SECRET`
- [ ] Change all default user passwords
- [ ] Configure `CORS_ORIGINS` for production
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (via reverse proxy)
- [ ] Review and adjust rate limiting if needed
- [ ] Test all user workflows
- [ ] Monitor logs for authentication failures

## Rollback Plan

If you need to rollback:

1. The old code is in your git history
2. Revert to previous commit: `git checkout <commit-hash>`
3. Restore database from backup: `node scripts/backup-database.js`
4. Old system doesn't require `.env` file

## Support

If you encounter issues:

1. Check the logs: `logs/access.log`
2. Test API: `curl http://localhost:3000/api/health`
3. Review SECURITY.md for details
4. Check token is being sent correctly
5. Verify `.env` file exists with proper values

## Timeline

- **Immediate**: Authentication now required for all API calls
- **Week 1**: Monitor for authentication issues
- **Week 2**: Update any external integrations
- **Month 1**: Review logs and adjust rate limiting

## Questions?

Refer to:
- `README.md` - General usage
- `SECURITY.md` - Security details
- `test/api.test.js` - API examples
- `public/js/auth.js` - Frontend auth implementation

---

**Last Updated:** April 2026
**Version:** 1.0.0
