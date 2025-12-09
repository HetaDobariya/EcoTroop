const express = require('express');
const router = express.Router();
const { submitConfirmation } = require('../services/pickupService');

// Submit order confirmation (after weight and payment)
router.post('/submit-confirmation', async (req, res) => {
  try {
    const result = await submitConfirmation(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in submit-confirmation:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit order confirmation' 
    });
  }
});

module.exports = router;
