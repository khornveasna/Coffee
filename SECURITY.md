# Security Improvements - Coffee POS System

## Overview
This document outlines the security improvements made to the Coffee POS System.

## Security Features Implemented

### 1. JWT Authentication
- **Replaced** insecure client-side authentication with server-side JWT tokens
- **All API routes** now require valid JWT tokens in the Authorization header
- **Token format**: `Authorization: Bearer <token>`
- **Token expiration**: Configurable via `JWT_EXPIRES_IN` (default: 24h)

### 2. Rate Limiting
- **Global rate limit**: 100 requests per 15 minutes per IP
- **Auth endpoint limit**: 50 login attempts per 15 minutes per IP
- **Configurable** via environment variables:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX_REQUESTS`

### 3. Helmet Security Headers
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (in production)
- And more...

### 4. CORS Configuration
- **Configurable origins** via `CORS_ORIGINS` environment variable
- **Development mode**: Allows all origins
- **Production mode**: Restrict to specific domains

### 5. Input Validation
All POST/PUT endpoints validate request bodies:
- **Users**: username (3-50 chars), password (min 4 chars), fullname (2-100 chars), role
- **Products**: name (1-100 chars), price (positive number), salePrice
- **Orders**: items (array), subtotal, total (positive numbers), paymentMethod
- **Categories**: name, name_km (required, max 100 chars)
- **Settings**: Validates taxRate (0-100)

### 6. Authorization
Role-based access control implemented:
- **Admin**: Full access to all features
- **Manager**: Access to POS, items, orders, reports
- **Staff**: Access to POS and orders only

All protected routes verify user permissions server-side.

### 7. Database Transactions
- Order creation wrapped in transactions for data integrity
- Prevents partial writes on failure

### 8. Error Handling
- Global error handler prevents information leakage
- 404 handler for undefined routes
- Production mode hides stack traces
- Proper HTTP status codes (401, 403, 404, 500)

### 9. Secure Passwords
- bcrypt hashing with salt rounds
- Passwords never returned in API responses
- Default passwords should be changed on first login

## Security Best Practices

### For Development
1. Copy `.env.example` to `.env`
2. Generate a strong `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Update default user passwords immediately

### For Production
1. Set `NODE_ENV=production`
2. Use strong, unique `JWT_SECRET` and `SESSION_SECRET`
3. Configure `CORS_ORIGINS` to your domain(s)
4. Use HTTPS (via reverse proxy like nginx)
5. Regularly backup the database
6. Monitor rate limiting logs for abuse attempts
7. Keep dependencies updated: `npm audit` and `npm update`

## API Security

### Authentication Flow
```javascript
// 1. Login
POST /api/auth/login
Body: { username: 'admin', password: '1234' }
Response: { success: true, token: 'eyJ...', user: {...} }

// 2. Use token in subsequent requests
GET /api/users
Headers: { Authorization: 'Bearer eyJ...' }

// 3. Logout (client-side)
localStorage.removeItem('coffeePOSToken');
```

### Protected Routes
All routes under `/api/*` and `/api/v1/*` require authentication except:
- `POST /api/auth/login`
- `GET /api/health`

### Token Expiration
- Tokens expire after the duration set in `JWT_EXPIRES_IN`
- Expired tokens return 401 Unauthorized
- Client must re-authenticate to get a new token

## Monitoring & Logging

### HTTP Logging
- Morgan logger logs all requests
- Production: Writes to `logs/access.log`
- Development: Console output in 'dev' format

### What's Logged
- Request method and URL
- Response status code
- Response time
- User agent

## Known Limitations

1. **SQLite**: No row-level security; relies on application logic
2. **localStorage**: Token storage vulnerable to XSS (consider httpOnly cookies for higher security)
3. **No CSRF protection**: Not needed for API-only backend, but consider if adding web forms
4. **No audit trail**: Consider adding activity logging for compliance

## Future Improvements

- [ ] Implement refresh tokens for seamless re-authentication
- [ ] Add request ID tracking for debugging
- [ ] Implement IP-based blocking for repeated failures
- [ ] Add 2FA (Two-Factor Authentication) for admin accounts
- [ ] Move token to httpOnly secure cookie
- [ ] Add SQL injection protection layer (defense in depth)
- [ ] Implement API key authentication for integrations
- [ ] Add comprehensive audit logging

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the maintainer directly. Do NOT open a public GitHub issue.

## License

MIT License - See LICENSE file for details
