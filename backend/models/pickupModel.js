const db = require('../config/db');

const Pickup = {
  create: (pickupData, callback) => {
    const { userid, device_name, estimate_weight, contact, email, date, address } = pickupData;
    const sql = "INSERT INTO pickup_req (userid, device_name, estimate_weight, contact, email, date, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [userid, device_name, estimate_weight, contact, email, date, address], callback);
  },

  getAll: (callback) => {
    const sql = "SELECT * FROM pickup_req ORDER BY date DESC";
    db.query(sql, callback);
  },

  getByUserId: (userId, callback) => {
    const sql = "SELECT * FROM pickup_req WHERE userid = ? ORDER BY date DESC";
    db.query(sql, [userId], callback);
  },

  getById: (pickupId, callback) => {
    const sql = "SELECT * FROM pickup_req WHERE pickup_id = ?";
    db.query(sql, [pickupId], callback);
  },

  updateStatus: (pickupId, status, callback) => {
    const sql = "UPDATE pickup_req SET status = ? WHERE pickup_id = ?";
    db.query(sql, [status, pickupId], callback);
  }
};

module.exports = Pickup;