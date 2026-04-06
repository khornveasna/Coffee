const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

module.exports = function productsRoutes(db, broadcast) {
    const router = express.Router();

    // Validation rules
    const validateProduct = [
        body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Product name is required (max 100 chars)'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
        body('category_id').optional().trim().isLength({ min: 1 }).withMessage('Category ID is required')
    ];

    // GET products (with optional filters and pagination)
    router.get('/', authMiddleware.authenticate, (req, res) => {
        try {
            const { category, search, active, page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = `
                SELECT p.*, c.name as category_name, c.name_km as category_name_km
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE 1=1
            `;
            const params = [];

            if (category && category !== 'all') {
                query += ' AND p.category_id = ?';
                params.push(category);
            }
            if (search) {
                query += ' AND (p.name LIKE ? OR p.name_km LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            if (active !== undefined) {
                query += ' AND p.active = ?';
                params.push(active ? 1 : 0);
            }

            // Get total count
            const countQuery = query.replace('SELECT p.*, c.name as category_name, c.name_km as category_name_km', 'SELECT COUNT(*) as count');
            const total = db.prepare(countQuery).get(...params);

            query += ' ORDER BY p.name LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const products = db.prepare(query).all(...params);
            
            res.json({ 
                success: true, 
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total.count,
                    totalPages: Math.ceil(total.count / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // GET single product
    router.get('/:id', authMiddleware.authenticate, (req, res) => {
        try {
            const product = db.prepare(`
                SELECT p.*, c.name as category_name, c.name_km as category_name_km
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            `).get(req.params.id);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            res.json({ success: true, product });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // POST create product
    router.post('/', authMiddleware.authenticate, authMiddleware.requirePermission('items'), validateProduct, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { name, name_km, category_id, price, salePrice, image, icon, description, active } = req.body;
            const id = uuidv4();

            db.prepare(`
                INSERT INTO products (id, name, name_km, category_id, price, salePrice, image, icon, description, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, name, name_km || name, category_id, price, salePrice || 0, image, icon || 'fa-box', description, active !== false ? 1 : 0);

            broadcast('product-created', { id, name, name_km, category_id, price, salePrice, image, icon, description, active });
            res.status(201).json({ 
                success: true, 
                message: 'Product created successfully', 
                product: { id, name, name_km, category_id, price, salePrice, image, icon, description, active } 
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // PUT update product
    router.put('/:id', authMiddleware.authenticate, authMiddleware.requirePermission('items'), validateProduct, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { name, name_km, category_id, price, salePrice, image, icon, description, active } = req.body;

            db.prepare(`
                UPDATE products
                SET name=?, name_km=?, category_id=?, price=?, salePrice=?, image=?, icon=?, description=?, active=?
                WHERE id=?
            `).run(name, name_km || name, category_id, price, salePrice || 0, image, icon, description, active !== false ? 1 : 0, req.params.id);

            broadcast('product-updated', { id: req.params.id, name, name_km, category_id, price, salePrice, image, icon, description, active });
            res.json({ success: true, message: 'Product updated successfully' });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    // DELETE product
    router.delete('/:id', authMiddleware.authenticate, authMiddleware.requirePermission('items'), (req, res) => {
        try {
            db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
            broadcast('product-deleted', { id: req.params.id });
            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
