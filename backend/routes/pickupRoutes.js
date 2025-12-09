const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { verifyToken } = require('../middleware/authMiddleware'); // Add this
const { submitConfirmation } = require('../services/pickupService');

// Protected routes (require authentication)
router.post('/', verifyToken, pickupController.createPickup); // Add verifyToken middleware
router.get('/', pickupController.getAllPickups); // Add verifyToken middleware
router.post('/accept', pickupController.acceptPickupRequest); // Add verifyToken middleware
router.post('/reject', pickupController.rejectPickupRequest); // Add verifyToken middleware

// Confirm pickup with weight and payment
router.post('/confirm', async (req, res) => { // Add verifyToken middleware
  try {
    const result = await submitConfirmation(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error confirming pickup:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to confirm pickup' 
    });
  }
});

module.exports = router;