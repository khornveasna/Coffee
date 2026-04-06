// Product Routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const socketService = require('../services/socket');

// Middleware to attach broadcast function to request
router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get specific product
router.get('/:id', productController.getProduct);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
