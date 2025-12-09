const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Feedback routes
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.delete('/:id',feedbackController.deleteFeedback);

module.exports = router;
