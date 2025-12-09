const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User authentication routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/session', authController.checkSession);

module.exports = router;
