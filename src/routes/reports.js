// Report Routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/summary', reportController.getSummary);
router.get('/sales-by-date', reportController.getSalesByDate);
router.get('/top-products', reportController.getTopProducts);

module.exports = router;
