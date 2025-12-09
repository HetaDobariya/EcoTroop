const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser); // Add logout route

// Protected routes (require authentication)
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateProfile);

// Admin-only routes
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;