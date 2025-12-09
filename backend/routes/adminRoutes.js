const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Admin authentication routes
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/profile', verifyAdmin, adminController.getProfile);

// Protected admin route - requires valid admin token
router.get('/protected', verifyAdmin, (req, res) => {
    res.json({ 
        success: true,
        message: 'Protected admin route', 
        admin: {
            id: req.admin.adminId,
            email: req.admin.email,
            role: req.admin.role
        },
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint for admin routes
router.get('/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok',
        service: 'admin-api',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
