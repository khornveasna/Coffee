// Product Controller
const productModel = require('../models/Product');

class ProductController {
    async getAllProducts(req, res) {
        try {
            const { category, search, active } = req.query;
            
            const filters = {};
            if (category) filters.category = category;
            if (search) filters.search = search;
            if (active !== undefined) filters.active = active === 'true' || active === '1';

            const products = productModel.findAll(filters);

            res.json({ 
                success: true, 
                products 
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async getProduct(req, res) {
        try {
            const { id } = req.params;
            
            const product = productModel.findById(id);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }

            res.json({ 
                success: true, 
                product 
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async createProduct(req, res) {
        try {
            const { name, name_km, category_id, price, salePrice, image, icon, description, active } = req.body;

            // Validate input
            if (!name || price === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name and price are required' 
                });
            }

            const product = productModel.create({
                name,
                name_km,
                category_id,
                price,
                salePrice,
                image,
                icon,
                description,
                active
            });

            // Broadcast product created event
            if (req.broadcast) {
                req.broadcast('product-created', product);
            }

            res.status(201).json({ 
                success: true, 
                message: 'Product created successfully',
                product 
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const existing = productModel.findById(id);
            if (!existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }

            const updatedProduct = productModel.update(id, updateData);

            // Broadcast product updated event
            if (req.broadcast) {
                req.broadcast('product-updated', updatedProduct);
            }

            res.json({ 
                success: true, 
                message: 'Product updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const existing = productModel.findById(id);
            if (!existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }

            productModel.delete(id);

            // Broadcast product deleted event
            if (req.broadcast) {
                req.broadcast('product-deleted', { id });
            }

            res.json({ 
                success: true, 
                message: 'Product deleted successfully' 
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}

module.exports = new ProductController();
