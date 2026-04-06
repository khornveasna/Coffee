# Coffee POS System - Express.js Edition ☕

A modern, modular **Express.js** Point of Sale (POS) system for coffee shops with REST API, SQLite database, and real-time synchronization using Socket.IO.

## 🎯 What's New in v2.0

The application has been **completely refactored** from a monolithic architecture to a **modular Express.js MVC-style structure**:

- ✅ **Express Router** for organized API endpoints
- ✅ **MVC Pattern** (Model-View-Controller)
- ✅ **Separation of Concerns** (routes, controllers, models, middleware, services)
- ✅ **Morgan** HTTP request logging
- ✅ **Error Handling Middleware** for robust error management
- ✅ **Helmet** for security headers
- ✅ **Rate Limiting** for API protection
- ✅ **Socket.IO Service** for real-time sync
- ✅ **Lazy Loading** for database connections

## 📁 Project Structure

```
Coffee POS System/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   ├── reportController.js
│   │   └── settingsController.js
│   │
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Category.js
│   │
│   ├── routes/               # API route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── categories.js
│   │   ├── reports.js
│   │   └── settings.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication & authorization
│   │   └── errorHandler.js  # Error handling
│   │
│   └── services/             # Business logic services
│       ├── database.js      # Database initialization & management
│       └── socket.js        # Socket.IO real-time service
│
├── public/                   # Static frontend files
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── data.js
│
├── server.js                 # Main Express application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (create from .env.example)
└── coffee_pos.db             # SQLite database (auto-created)
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3000/api/health

### Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

## 📡 REST API Endpoints

### Authentication
```
POST   /api/auth/login              - User login
GET    /api/auth/profile/:id        - Get user profile
```

### Users (Admin Only)
```
GET    /api/users                   - Get all users
GET    /api/users/:id               - Get specific user
POST   /api/users                   - Create new user
PUT    /api/users/:id               - Update user
DELETE /api/users/:id               - Delete user
```

### Products
```
GET    /api/products                - Get all products
GET    /api/products/:id            - Get specific product
POST   /api/products                - Create new product
PUT    /api/products/:id            - Update product
DELETE /api/products/:id            - Delete product
```

### Orders
```
GET    /api/orders                  - Get all orders
GET    /api/orders/:id              - Get specific order
POST   /api/orders                  - Create new order
DELETE /api/orders/:id              - Delete order
```

### Categories
```
GET    /api/categories              - Get all categories
GET    /api/categories/:id          - Get specific category
POST   /api/categories              - Create new category
PUT    /api/categories/:id          - Update category
DELETE /api/categories/:id          - Delete category
```

### Reports
```
GET    /api/reports/summary         - Get report summary
GET    /api/reports/sales-by-date   - Get sales by date
GET    /api/reports/top-products    - Get top products
```

### Settings
```
GET    /api/settings                - Get all settings
PUT    /api/settings                - Update settings
```

### Health Check
```
GET    /api/health                  - API health status
```

## 🔧 Architecture Details

### MVC Pattern

**Models** (`src/models/`)
- Handle database operations
- Provide CRUD operations
- Use lazy loading for database connections
- Return sanitized data

**Controllers** (`src/controllers/`)
- Handle HTTP requests
- Validate input data
- Call model methods
- Send responses
- Trigger real-time events via Socket.IO

**Routes** (`src/routes/`)
- Define API endpoints
- Attach middleware
- Map routes to controllers
- Attach broadcast function for real-time events

**Services** (`src/services/`)
- `database.js`: Database initialization, table creation, seeding
- `socket.js`: Socket.IO real-time event broadcasting

**Middleware** (`src/middleware/`)
- `auth.js`: Permission-based authorization
- `errorHandler.js`: Centralized error handling

### Real-time Synchronization

Socket.IO broadcasts events across all connected clients:
- `user-created`, `user-updated`, `user-deleted`
- `product-created`, `product-updated`, `product-deleted`
- `order-created`, `order-deleted`
- `user-status` (online/offline)

### Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse (100 requests per 15 min)
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Request body validation in controllers
- **Error Handling**: Graceful error responses without exposing internals

### Logging

**Morgan HTTP Logger**
- Development mode: `dev` format (colored, concise)
- Production mode: `combined` format (Apache standard)

## 🌐 Environment Variables

Create a `.env` file from `.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./coffee_pos.db
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Default Credentials

| Username | Password | Role    | Permissions                    |
|----------|----------|---------|--------------------------------|
| admin    | 1234     | admin   | Full access (all permissions)  |
| manager  | 1234     | manager | pos, items, orders, reports    |
| staff    | 1234     | staff   | pos, orders                    |

## 🔨 Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm run production  # Start in production mode
npm run setup       # Install dependencies and run migrations
npm run backup-db   # Backup database
npm run health-check  # Check API health
npm run security-check  # Audit dependencies
npm run clean       # Clean logs and backups
```

## 🗄️ Database

**SQLite** with better-sqlite3 (synchronous, fast, no setup required)

**Tables:**
- `users` - User accounts with authentication
- `products` - Menu items/products
- `categories` - Product categories
- `orders` - Sales transactions
- `settings` - Application settings

## 🚢 Deployment

### Production Mode

```bash
npm run production
```

### With PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name coffee-pos
pm2 save
pm2 startup
```

### IIS Deployment

Use the provided deployment scripts:
- `deploy-iis.bat`
- `deploy-iis.ps1`

See `IIS_DEPLOYMENT_GUIDE.md` for details.

## 📝 API Usage Examples

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: '1234' })
});
const data = await response.json();
```

### Get Products
```javascript
const response = await fetch('/api/products?category=cat_coffee&search=coffee');
const products = await response.json();
```

### Create Order
```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ id: 'prod_1', name: 'Coffee', quantity: 2, price: 8000 }],
    subtotal: 16000,
    total: 16000,
    userId: 'user_admin',
    userName: 'Admin'
  })
});
```

## 🔄 Migration from v1.x

The v2.0 refactoring maintains **full backward compatibility**:
- All existing API endpoints work the same
- Frontend code requires no changes
- Database schema unchanged
- Socket.IO events unchanged

**What changed:**
- Internal code organization (MVC pattern)
- Added middleware stack
- Improved error handling
- Better logging
- Enhanced security

## 🐛 Troubleshooting

**Server won't start:**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process
taskkill /F /PID <PID>
```

**Database errors:**
```bash
# Delete and recreate database
del coffee_pos.db
npm start
```

**Module not found:**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Technology Stack

- **Backend:** Express.js 4.18
- **Database:** SQLite (better-sqlite3)
- **Real-time:** Socket.IO 4.8
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Morgan
- **Authentication:** bcryptjs
- **Frontend:** Vanilla JS, HTML5, CSS3

## 🤝 Contributing

1. Follow the MVC pattern
2. Add controllers to `src/controllers/`
3. Add models to `src/models/`
4. Add routes to `src/routes/`
5. Use the error handler middleware
6. Test all endpoints

## 📄 License

MIT

## 🎉 Features

✅ RESTful API with proper routing  
✅ Real-time synchronization  
✅ Role-based access control  
✅ Product management  
✅ Order management  
✅ Sales reporting  
✅ Multi-user support  
✅ Khmer language support  
✅ Responsive design  
✅ Production-ready  

---

**Built with ❤️ for Coffee Shops** ☕
