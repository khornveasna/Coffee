// User Routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const socketService = require('../services/socket');

// Middleware to attach broadcast function to request
router.use((req, res, next) => {
    req.broadcast = (event, data) => {
        socketService.broadcast(event, data);
    };
    next();
});

// GET /api/users - Get all users (admin only)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get specific user
router.get('/:id', userController.getUser);

// POST /api/users - Create new user (admin only)
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
