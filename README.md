# ☕ Coffee POS System

> **Production-Ready Point of Sale System for Coffee Shops**

A complete, production-ready POS (Point of Sale) system designed specifically for coffee shops. Built with Node.js, Express, SQLite, and real-time synchronization using Socket.io. Features a beautiful Khmer language interface and comprehensive user permission system.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)](https://www.microsoft.com/windows)

---

## ✨ Features

### 🎯 Core Features
- **Point of Sale (POS)** - Fast and intuitive checkout process
- **Product Management** - Manage coffee items, categories, and pricing
- **Order Management** - Track and manage all orders with history
- **User Management** - Role-based access control (Admin, Manager, Staff)
- **Reports & Analytics** - Sales reports, statistics, and insights
- **Real-time Sync** - Multi-user support with live updates

### 🔒 Security Features
- **Password Encryption** - bcrypt for secure password hashing
- **JWT Authentication** - Secure session management
- **Role-based Permissions** - Granular access control
- **Rate Limiting** - Protection against abuse
- **Security Headers** - Helmet.js integration
- **CORS Protection** - Configurable origins

### 📊 Database
- **SQLite** - Lightweight, serverless database
- **Automatic Backups** - Scheduled backup scripts
- **Data Migration** - Easy schema updates
- **Data Integrity** - Foreign key constraints

### 🌐 Deployment Ready
- **IIS Support** - Full IIS integration with web.config
- **PM2 Ready** - Process manager configuration
- **Docker Ready** - (Coming soon)
- **Environment Config** - Flexible .env configuration
- **Health Checks** - Built-in monitoring endpoint

### 🎨 User Interface
- **Khmer Language** - Full Cambodian localization
- **Responsive Design** - Works on all devices
- **Modern UI** - Clean and intuitive interface
- **Real-time Updates** - Live data synchronization

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Windows Server 2012 R2+ or Windows 10/11 Pro

### Installation

```bash
# Clone or download the project
cd "Coffee POS System"

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env and set SESSION_SECRET

# Start the server
npm start
```

**Open browser:** `http://localhost:3000`

**Default Login:**
- Username: `admin`
- Password: `1234`

---

## 📦 Deployment

### IIS Deployment (Recommended for Windows)

**Automated:**
```powershell
# Run as Administrator
.\deploy-iis.ps1
```

**Manual:**
See [IIS Deployment Guide](IIS_DEPLOYMENT_GUIDE.md)

### PM2 Deployment

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Production Checklist

Before deploying to production, see [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](QUICK_START.md) | Get started quickly |
| [How to Run](HOW_TO_RUN.md) | Step-by-step running guide |
| [IIS Deployment](IIS_DEPLOYMENT_GUIDE.md) | Complete IIS deployment |
| [IIS Quick Start](IIS_QUICK_START.md) | Fast IIS deployment |
| [Production Deployment](PRODUCTION_DEPLOYMENT.md) | Production-ready guide |
| [Production Checklist](PRODUCTION_CHECKLIST.md) | Pre-deployment checklist |
| [API Documentation](API_DOCUMENTATION.md) | REST API reference |
| [User Permissions](USER_PERMISSIONS_GUIDE.md) | Permission system guide |
| [REST API Integration](REST_API_INTEGRATION.md) | Technical details |

---

## 🛠️ Scripts

```bash
# Start server
npm start

# Development mode (auto-restart)
npm run dev

# Production mode
npm run production

# Setup (install + migrate)
npm run setup

# Backup database
npm run backup-db

# Health check
npm run health-check

# Security audit
npm run security-check

# Clean logs and backups
npm run clean
```

---

## 📁 Project Structure

```
Coffee POS System/
├── server.js                 # Main server file
├── server-production.js      # Production wrapper
├── app.js                    # Frontend application
├── data.js                   # Data management
├── config.js                 # Configuration manager
├── index.html                # Main HTML file
├── styles.css                # Stylesheet
├── package.json              # Dependencies & scripts
├── ecosystem.config.js       # PM2 configuration
├── web.config                # IIS configuration
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── coffee_pos.db             # SQLite database
│
├── scripts/
│   └── backup-database.js    # Database backup script
│
├── deploy-iis.ps1            # IIS deployment script
├── deploy-iis.bat            # IIS batch deployment
├── start-production.bat      # Production startup
├── backup-database.bat       # Database backup
├── migrate-db.js             # Database migration
│
└── Documentation/
    ├── README.md
    ├── QUICK_START.md
    ├── HOW_TO_RUN.md
    ├── START_HERE.md
    ├── IIS_DEPLOYMENT_GUIDE.md
    ├── IIS_QUICK_START.md
    ├── PRODUCTION_DEPLOYMENT.md
    ├── PRODUCTION_CHECKLIST.md
    ├── API_DOCUMENTATION.md
    ├── USER_PERMISSIONS_GUIDE.md
    └── REST_API_INTEGRATION.md
```

---

## 🔐 Security

### Environment Variables

Create `.env` file with:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<generate-random-string>
CORS_ORIGINS=http://yourdomain.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Security Features
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (Helmet.js)
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection
- ✅ CSRF protection (same-site cookies)

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Create order
- `DELETE /api/orders/:id` - Delete order

### Reports
- `GET /api/reports/summary` - Sales summary

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Health Check
- `GET /api/health` - System health status

See [API Documentation](API_DOCUMENTATION.md) for complete reference.

---

## 🗄️ Database

### Default Users

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `1234` |
| Manager | `manager` | `1234` |
| Staff | `staff` | `1234` |

**⚠️ Change these passwords immediately after first login!**

### Backup Database

```bash
npm run backup-db
```

Backups are stored in `./backups/` directory.

### Restore Database

```bash
# Stop server
# Copy backup file
copy "backups\coffee_pos-backup-YYYY-MM-DD.db" "coffee_pos.db"
# Restart server
```

---

## 🔄 Real-time Features

The system uses Socket.io for real-time synchronization:

- **User Status** - See who's online
- **Order Updates** - Live order notifications
- **Product Changes** - Instant product updates
- **User Management** - Real-time user CRUD events

---

## 🎯 User Roles & Permissions

### Roles
- **Admin** - Full access (users, products, orders, reports)
- **Manager** - Products, orders, reports (no user management)
- **Staff** - POS and orders only

### Permissions
- `pos` - Access to point of sale
- `items` - Product management
- `orders` - Order history
- `reports` - Sales reports
- `users` - User management (Admin only)

---

## 🐛 Troubleshooting

### Server won't start
```bash
npm install
node migrate-db.js
npm start
```

### Port already in use
```bash
taskkill /F /IM node.exe
npm start
```

### Database errors
```bash
node migrate-db.js
```

### Permission denied
```powershell
icacls "Coffee POS System" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for more troubleshooting.

---

## 📈 Performance

- **Startup Time**: < 2 seconds
- **Memory Usage**: ~50-100MB
- **Database Size**: ~1MB (grows with data)
- **Response Time**: < 100ms (local)
- **Concurrent Users**: 10+ (tested)

---

## 🧪 Testing

```bash
# Manual testing checklist
# See PRODUCTION_CHECKLIST.md

# Security audit
npm run security-check

# Health check
npm run health-check
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

- **Documentation**: Check the `Documentation` folder
- **Issues**: Report bugs via GitHub Issues
- **Email**: [Your Support Email]

---

## 🎉 Acknowledgments

- **Express.js** - Web framework
- **SQLite** - Database engine
- **Socket.io** - Real-time communication
- **bcrypt.js** - Password hashing
- **Font Awesome** - Icons
- **Google Fonts** - Kantumruy Pro font

---

## 📞 Contact

For questions or support:
- 📧 Email: [your-email@example.com]
- 🌐 Website: [your-website.com]
- 📱 Phone: [your-phone]

---

**Made with ❤️ for Coffee Shops**

*Last Updated: April 3, 2026*
*Version: 1.0.0*
