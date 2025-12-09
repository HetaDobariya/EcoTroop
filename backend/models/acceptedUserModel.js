const db = require('../config/db');

const AcceptedUser = {
  create: (userData, callback) => {
    const { pickup_id, userid, device_name, weight, contact, address, date, email, payment } = userData;
    const sql = `
      INSERT INTO accepted_user 
      (pickup_id, userid, device_name, weight, contact, address, date, email, payment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [pickup_id, userid, device_name, weight, contact, address, date, email, payment], callback);
  },

  getAll: (callback) => {
    const sql = 'SELECT * FROM accepted_user';
    db.query(sql, callback);
  },

  getLatestId: (callback) => {
    const sql = 'SELECT accepted_id FROM accepted_user ORDER BY accepted_id DESC LIMIT 1';
    db.query(sql, callback);
  },

  getTotalWeight: (callback) => {
    const sql = 'SELECT SUM(weight) AS totalWeight FROM accepted_user';
    db.query(sql, callback);
  },

  getTotalPayment: (callback) => {
    const sql = 'SELECT SUM(payment) AS totalPayment FROM accepted_user';
    db.query(sql, callback);
  },

  getMonthlyStats: (callback) => {
    const sql = `
      SELECT 
        MONTH(date) AS month,
        COUNT(*) AS count
      FROM accepted_user
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `;
    db.query(sql, callback);
  }
};

module.exports = AcceptedUser;
