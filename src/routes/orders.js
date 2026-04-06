// Order Routes
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const socketService = require('../services/socket');

router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.post('/', orderController.createOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
