const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

function generateReceiptNumber() {
    const date  = new Date();
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    const rand  = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${rand}`;
}

module.exports = function ordersRoutes(db, broadcast) {
    const router = express.Router();

    // Validation rules
    const validateOrder = [
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
        body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
        body('paymentMethod').isIn(['cash', 'card', 'khqr', 'bakong']).withMessage('Invalid payment method')
    ];

    // GET orders (with optional date / user filters and pagination)
    router.get('/', authMiddleware.authenticate, (req, res) => {
        try {
            const { date, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            let query = 'SELECT * FROM orders WHERE 1=1';
            const params = [];

            if (date)      { query += ' AND DATE(date) = ?';    params.push(date); }
            if (startDate) { query += ' AND DATE(date) >= ?';   params.push(startDate); }
            if (endDate)   { query += ' AND DATE(date) <= ?';   params.push(endDate); }
            if (userId)    { query += ' AND userId = ?';        params.push(userId); }
            
            // Non-admin users can only see their own orders
            if (req.user.role !== 'admin' && req.user.role !== 'manager') {
                query += ' AND userId = ?';
                params.push(req.user.id);
            }

            // Get total count
            const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
            const total = db.prepare(countQuery).get(...params);

            query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const orders = db.prepare(query).all(...params);
            
            res.json({ 
                success: true, 
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total.count,
                    totalPages: Math.ceil(total.count / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // GET single order
    router.get('/:id', authMiddleware.authenticate, (req, res) => {
        try {
            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            
            // Non-admin users can only view their own orders
            if (req.user.role !== 'admin' && order.userId !== req.user.id) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'អ្នកមិនមានសិទ្ធិមើលការបញ្ជាទិញនេះទេ!' 
                });
            }
            
            res.json({ success: true, order });
        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // POST create order
    router.post('/', authMiddleware.authenticate, validateOrder, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { items, subtotal, discountPercent, discountAmount, total, paymentMethod } = req.body;
            
            const id            = uuidv4();
            const receiptNumber = generateReceiptNumber();
            const date          = new Date().toISOString();

            // Use transaction for order creation
            const transaction = db.transaction(() => {
                db.prepare(`
                    INSERT INTO orders (id, receiptNumber, date, items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    id, 
                    receiptNumber, 
                    date, 
                    JSON.stringify(items), 
                    subtotal, 
                    discountPercent || 0, 
                    discountAmount || 0, 
                    total, 
                    paymentMethod || 'cash', 
                    req.user.id,
                    req.user.username
                );
            });

            transaction();

            broadcast('order-created', { 
                id, 
                receiptNumber, 
                date, 
                items, 
                subtotal, 
                discountPercent, 
                discountAmount, 
                total, 
                paymentMethod, 
                userId: req.user.id, 
                userName: req.user.username 
            });
            
            res.status(201).json({ 
                success: true, 
                message: 'Order created successfully', 
                order: { 
                    id, 
                    receiptNumber, 
                    date, 
                    items, 
                    subtotal, 
                    discountPercent, 
                    discountAmount, 
                    total, 
                    paymentMethod, 
                    userId: req.user.id, 
                    userName: req.user.username 
                } 
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // DELETE order (admin/manager only)
    router.delete('/:id', authMiddleware.authenticate, (req, res) => {
        try {
            if (!['admin', 'manager'].includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'មានតែ Admin ឬ Manager ទេដែលអាចលុបការបញ្ជាទិញ!' 
                });
            }

            db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
            broadcast('order-deleted', { id: req.params.id });
            res.json({ success: true, message: 'Order deleted successfully' });
        } catch (error) {
            console.error('Delete order error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
