const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get all accepted users
router.get('/accepted', dashboardController.getAllAccepted);

// Get latest accepted ID
router.get('/accepted-count', dashboardController.getLatestAcceptedId);

// Get total weight
router.get('/total-weight', dashboardController.getTotalWeight);

// Get total payment
router.get('/total-payment', dashboardController.getTotalPayment);

// Get monthly accepted data
router.get('/monthly-accepted', dashboardController.getMonthlyAccepted);

// Get monthly weight data
router.get('/monthly-weight', dashboardController.getMonthlyWeight);

// Get monthly payment data
router.get('/monthly-payment', dashboardController.getMonthlyPayment);

// Get recent updates
router.get('/update', dashboardController.getRecentUpdates);

// Get customer graph data
router.get('/customer-graph', dashboardController.getCustomerGraphData);

module.exports = router;
