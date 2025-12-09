const express = require('express');
const router = express.Router();
const acceptedUserController = require('../controllers/acceptedUserController');

// Accepted user routes
router.post('/submit-confirmation', acceptedUserController.submitConfirmation);
router.get('/', acceptedUserController.getAllAcceptedUsers);
router.get('/latest-id', acceptedUserController.getLatestAcceptedId);
router.get('/total-weight', acceptedUserController.getTotalWeight);
router.get('/total-payment', acceptedUserController.getTotalPayment);
router.get('/monthly-stats', acceptedUserController.getMonthlyStats);

module.exports = router;
