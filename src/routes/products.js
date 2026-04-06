// Product Routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const socketService = require('../services/socket');

router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
