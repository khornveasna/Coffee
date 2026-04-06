<<<<<<< HEAD
// Category Routes
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Get specific category
router.get('/:id', categoryController.getCategory);

// POST /api/categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
=======
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

module.exports = function categoriesRoutes(db) {
    const router = express.Router();

    // Validation rules
    const validateCategory = [
        body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required (max 100 chars)'),
        body('name_km').trim().isLength({ min: 1 }).withMessage('Khmer name is required')
    ];

    router.get('/', authMiddleware.authenticate, (req, res) => {
        try {
            const categories = db.prepare('SELECT * FROM categories WHERE active = 1 ORDER BY name').all();
            res.json({ success: true, categories });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    router.post('/', authMiddleware.authenticate, authMiddleware.requirePermission('items'), validateCategory, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { name, name_km, icon } = req.body;
            const id = uuidv4();
            db.prepare('INSERT INTO categories (id, name, name_km, icon, active) VALUES (?, ?, ?, ?, 1)')
                .run(id, name, name_km, icon || 'fa-box');
            res.status(201).json({ 
                success: true, 
                message: 'Category created successfully', 
                category: { id, name, name_km, icon } 
            });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

<<<<<<< HEAD
    router.put('/:id', authMiddleware.authenticate, authMiddleware.requirePermission('items'), validateCategory, (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

=======
    router.put('/:id', (req, res) => {
        try {
>>>>>>> 1c4cfcfa268777b324e7573d177d9ac99cf2354e
            const { name, name_km, icon } = req.body;
            const { id } = req.params;
            const result = db.prepare('UPDATE categories SET name = ?, name_km = ?, icon = ? WHERE id = ?')
                .run(name, name_km, icon || 'fa-box', id);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
<<<<<<< HEAD
            res.json({ 
                success: true, 
                message: 'Category updated successfully', 
                category: { id, name, name_km, icon } 
            });
=======
            res.json({ success: true, message: 'Category updated successfully', category: { id, name, name_km, icon } });
>>>>>>> 1c4cfcfa268777b324e7573d177d9ac99cf2354e
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

<<<<<<< HEAD
    router.delete('/:id', authMiddleware.authenticate, authMiddleware.requirePermission('items'), (req, res) => {
        try {
            const { id } = req.params;

            // Check if any products use this category
            const productsUsingCat = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id);
            if (productsUsingCat.count > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete category. ${productsUsingCat.count} products are using this category.`
                });
            }

=======
    router.delete('/:id', (req, res) => {
        try {
            const { id } = req.params;
            
            // Check if any products use this category
            const productsUsingCat = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id);
            if (productsUsingCat.count > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot delete category. ${productsUsingCat.count} products are using this category.` 
                });
            }
            
>>>>>>> 1c4cfcfa268777b324e7573d177d9ac99cf2354e
            const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    return router;
};
>>>>>>> acbaef74e4deb37ef63c984d184b45dcbd99c93d
