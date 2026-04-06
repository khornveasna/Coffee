const express = require('express');
const authMiddleware = require('../middleware/auth');

module.exports = function reportsRoutes(db) {
    const router = express.Router();

    router.get('/summary', authMiddleware.authenticate, authMiddleware.requirePermission('reports'), (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            let dateFilter = '';
            const params  = [];

            if (startDate && endDate) {
                dateFilter = ' AND DATE(date) BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            // Non-admin users can only see their own reports
            if (req.user.role !== 'admin' && req.user.role !== 'manager') {
                dateFilter += ' AND userId = ?';
                params.push(req.user.id);
            }

            const totalRevenue  = db.prepare(`SELECT COALESCE(SUM(total), 0)          as total FROM orders WHERE 1=1${dateFilter}`).get(...params);
            const totalOrders   = db.prepare(`SELECT COUNT(*)                          as count FROM orders WHERE 1=1${dateFilter}`).get(...params);
            const totalDiscount = db.prepare(`SELECT COALESCE(SUM(discountAmount), 0) as total FROM orders WHERE 1=1${dateFilter}`).get(...params);

            const topProduct = db.prepare(`
                SELECT json_extract(value, '$.name')     as name,
                       SUM(json_extract(value, '$.quantity')) as qty
                FROM   orders, json_each(items)
                WHERE  1=1${dateFilter}
                GROUP  BY name
                ORDER  BY qty DESC
                LIMIT  1
            `).get(...params);

            res.json({
                success: true,
                stats: {
                    totalRevenue:  totalRevenue.total,
                    totalOrders:   totalOrders.count,
                    totalDiscount: totalDiscount.total,
                    topProduct:    topProduct ? topProduct.name : null,
                    avgOrderValue: totalOrders.count > 0 ? totalRevenue.total / totalOrders.count : 0
                }
            });
        } catch (error) {
            console.error('Get reports error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
