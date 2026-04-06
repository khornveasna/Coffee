// Order Controller
const orderModel = require('../models/Order');

class OrderController {
    async getAllOrders(req, res) {
        try {
            const { date, userId, startDate, endDate } = req.query;
            
            const filters = {};
            if (date) filters.date = date;
            if (userId) filters.userId = userId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const orders = orderModel.findAll(filters);

            res.json({ 
                success: true, 
                orders 
            });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getOrder(req, res) {
        try {
            const { id } = req.params;
            
            const order = orderModel.findById(id);
            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            res.json({ 
                success: true, 
                order 
            });
        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async createOrder(req, res) {
        try {
            const { items, subtotal, discountPercent, discountAmount, total, paymentMethod, userId, userName } = req.body;

            // Validate input
            if (!items || !subtotal || !total || !userId || !userName) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            const order = orderModel.create({
                items,
                subtotal,
                discountPercent,
                discountAmount,
                total,
                paymentMethod,
                userId,
                userName
            });

            // Broadcast order created event
            if (req.broadcast) {
                req.broadcast('order-created', order);
            }

            res.status(201).json({ 
                success: true, 
                message: 'Order created successfully',
                order 
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { id } = req.params;

            const existing = orderModel.findById(id);
            if (!existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            orderModel.delete(id);

            // Broadcast order deleted event
            if (req.broadcast) {
                req.broadcast('order-deleted', { id });
            }

            res.json({ 
                success: true, 
                message: 'Order deleted successfully' 
            });
        } catch (error) {
            console.error('Delete order error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new OrderController();
