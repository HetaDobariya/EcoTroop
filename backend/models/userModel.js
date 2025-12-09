const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM user WHERE email = ?";
    db.query(sql, [email], callback);
  },

  create: (userData, callback) => {
    const { name, email, password, mobile_no } = userData;
    const sql = "INSERT INTO user (name, email, password, mobile_no) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, mobile_no], callback);
  },
  
  findById: (userId, callback) => {
    const sql = "SELECT * FROM user WHERE userid = ?";
    db.query(sql, [userId], callback);
  },

  logActivity: (activityData, callback) => {
    const { userid, name, email, mobile_no, login_time } = activityData;
    const sql = "INSERT INTO user_activity (userid, name, email, mobile_no, login_time) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userid, name, email, mobile_no, login_time], callback);
  },

  findById: (userId, callback) => {
    const sql = "SELECT * FROM user WHERE userid = ?";
    db.query(sql, [userId], callback);
  },

  delete: (userId, callback) => {
  const sql = "DELETE FROM user WHERE userid = ?";
  db.query(sql, [userId], callback);
},

};

module.exports = User;
