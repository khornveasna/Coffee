// Category Controller
const categoryModel = require('../models/Category');

class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = categoryModel.findAll();

            res.json({ 
                success: true, 
                categories 
            });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getCategory(req, res) {
        try {
            const { id } = req.params;
            
            const category = categoryModel.findById(id);
            if (!category) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Category not found' 
                });
            }

            res.json({ 
                success: true, 
                category 
            });
        } catch (error) {
            console.error('Get category error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async createCategory(req, res) {
        try {
            const { name, name_km, icon } = req.body;

            // Validate input
            if (!name || !name_km) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name and name_km are required' 
                });
            }

            const category = categoryModel.create({
                name,
                name_km,
                icon
            });

            res.status(201).json({ 
                success: true, 
                message: 'Category created successfully',
                category 
            });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const existing = categoryModel.findById(id);
            if (!existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Category not found' 
                });
            }

            const updatedCategory = categoryModel.update(id, updateData);

            res.json({ 
                success: true, 
                message: 'Category updated successfully',
                category: updatedCategory
            });
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            const existing = categoryModel.findById(id);
            if (!existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Category not found' 
                });
            }

            categoryModel.delete(id);

            res.json({ 
                success: true, 
                message: 'Category deleted successfully' 
            });
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new CategoryController();
