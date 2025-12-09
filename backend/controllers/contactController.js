const Contact = require('../models/contactModel');

const createContact = (req, res) => {
  const date = new Date();
  const { name, email, contact, message } = req.body;

  Contact.create({ name, email, contact, message, date }, (err, data) => {
    if (err) {
      console.error("Error inserting contact data:", err);
      return res.status(500).json({ message: 'Error inserting contact data' });
    }
    return res.json({ message: 'Contact request submitted' });
  });
};

const getAllContacts = (req, res) => {
  Contact.getAll((err, data) => {
    if (err) {
      console.error("Error fetching contacts:", err);
      return res.status(500).json({ error: 'Error fetching contacts' });
    }
    return res.json(data);
  });
};

const deleteContact = (req, res) => {
  const contactId = req.params.id; // Extract contact ID from URL params
  
  Contact.delete(contactId, (err, data) => {
    if (err) {
      console.error("Error deleting contact:", err);
      return res.status(500).json({ error: 'Error deleting contact' });
    }
    
    // Check if any contact was actually deleted
    if (data.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    return res.json({ 
      message: 'Contact deleted successfully', 
      affectedRows: data.affectedRows 
    });
  });
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact
};
