// Order Routes
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const socketService = require('../services/socket');

// Middleware to attach broadcast function to request
router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

// GET /api/orders - Get all orders
router.get('/', orderController.getAllOrders);

// GET /api/orders/:id - Get specific order
router.get('/:id', orderController.getOrder);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
