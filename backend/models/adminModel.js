const db = require('../config/db');
const bcrypt = require('bcrypt');

const Admin = {
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM admin WHERE email = ?";
    db.query(sql, [email], callback);
  }
};

module.exports = Admin;
