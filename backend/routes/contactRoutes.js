const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Contact routes
router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.delete('/:id',contactController.deleteContact);

module.exports = router;
