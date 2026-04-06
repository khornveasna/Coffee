// Report Routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/summary - Get report summary
router.get('/summary', reportController.getSummary);

// GET /api/reports/sales-by-date - Get sales by date
router.get('/sales-by-date', reportController.getSalesByDate);

// GET /api/reports/top-products - Get top products
router.get('/top-products', reportController.getTopProducts);

module.exports = router;
