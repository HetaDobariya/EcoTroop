const db = require('../config/db');

const Contact = {
  create: (contactData, callback) => {
    const { name, email, contact, message, date } = contactData;
    const sql = "INSERT INTO contact (name, email, contact, message, date) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, email, contact, message, date], callback);
  },

  getAll: (callback) => {
    const sql = "SELECT contact_id, name, email, contact, message, date FROM contact";
    db.query(sql, callback);
  },

  // Add this to your Contact model object
delete: (contactId, callback) => {
  const sql = "DELETE FROM contact WHERE contact_id = ?";
  db.query(sql, [contactId], callback);
}
};

module.exports = Contact;
