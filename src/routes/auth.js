// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - User login
router.post('/login', authController.login);

// GET /api/users/:id - Get user profile (can be used after login)
router.get('/profile/:id', authController.getProfile);

module.exports = router;
