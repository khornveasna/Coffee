const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = function categoriesRoutes(db) {
    const router = express.Router();

    router.get('/', (req, res) => {
        try {
            const categories = db.prepare('SELECT * FROM categories').all();
            res.json({ success: true, categories });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    router.post('/', (req, res) => {
        try {
            const { name, name_km, icon } = req.body;
            const id = uuidv4();
            db.prepare('INSERT INTO categories (id, name, name_km, icon) VALUES (?, ?, ?, ?)')
                .run(id, name, name_km, icon || 'fa-box');
            res.json({ success: true, message: 'Category created successfully', category: { id, name, name_km, icon } });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    router.put('/:id', (req, res) => {
        try {
            const { name, name_km, icon } = req.body;
            const { id } = req.params;
            const result = db.prepare('UPDATE categories SET name = ?, name_km = ?, icon = ? WHERE id = ?')
                .run(name, name_km, icon || 'fa-box', id);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.json({ success: true, message: 'Category updated successfully', category: { id, name, name_km, icon } });
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

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
