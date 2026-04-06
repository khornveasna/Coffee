// Report Controller
const databaseService = require('../services/database');

class ReportController {
    async getSummary(req, res) {
        try {
            const db = databaseService.getDatabase();
            const { startDate, endDate } = req.query;

            let dateFilter = '';
            const params = [];

            if (startDate && endDate) {
                dateFilter = ' AND DATE(date) BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE 1=1${dateFilter}`).get(...params);
            const totalOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE 1=1${dateFilter}`).get(...params);
            const totalDiscount = db.prepare(`SELECT COALESCE(SUM(discountAmount), 0) as total FROM orders WHERE 1=1${dateFilter}`).get(...params);

            // Get top product
            const topProductQuery = `
                SELECT json_extract(value, '$.name') as name, SUM(json_extract(value, '$.quantity')) as qty
                FROM orders, json_each(items)
                WHERE 1=1${dateFilter}
                GROUP BY name
                ORDER BY qty DESC
                LIMIT 1
            `;
            const topProduct = db.prepare(topProductQuery).get(...params);

            res.json({
                success: true,
                stats: {
                    totalRevenue: totalRevenue.total,
                    totalOrders: totalOrders.count,
                    totalDiscount: totalDiscount.total,
                    topProduct: topProduct ? topProduct.name : null,
                    avgOrderValue: totalOrders.count > 0 ? totalRevenue.total / totalOrders.count : 0
                }
            });
        } catch (error) {
            console.error('Get reports error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getSalesByDate(req, res) {
        try {
            const db = databaseService.getDatabase();
            const { startDate, endDate } = req.query;

            let dateFilter = '';
            const params = [];

            if (startDate && endDate) {
                dateFilter = ' AND DATE(date) BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            const salesByDate = db.prepare(`
                SELECT 
                    DATE(date) as date,
                    COUNT(*) as order_count,
                    SUM(total) as total_sales,
                    AVG(total) as avg_order_value
                FROM orders
                WHERE 1=1${dateFilter}
                GROUP BY DATE(date)
                ORDER BY date DESC
            `).all(...params);

            res.json({
                success: true,
                salesByDate
            });
        } catch (error) {
            console.error('Get sales by date error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getTopProducts(req, res) {
        try {
            const db = databaseService.getDatabase();
            const { startDate, endDate, limit = 10 } = req.query;

            let dateFilter = '';
            const params = [];

            if (startDate && endDate) {
                dateFilter = ' AND DATE(o.date) BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            params.push(parseInt(limit));

            const topProducts = db.prepare(`
                SELECT 
                    json_extract(value, '$.name') as product_name,
                    SUM(json_extract(value, '$.quantity')) as total_quantity,
                    SUM(json_extract(value, '$.quantity') * json_extract(value, '$.price')) as total_revenue
                FROM orders o, json_each(o.items)
                WHERE 1=1${dateFilter}
                GROUP BY product_name
                ORDER BY total_quantity DESC
                LIMIT ?
            `).all(...params);

            res.json({
                success: true,
                topProducts
            });
        } catch (error) {
            console.error('Get top products error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new ReportController();
