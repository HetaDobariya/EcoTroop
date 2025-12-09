const db = require('../config/db');

const Feedback = {
  create: (feedbackData, callback) => {
    const { email, message } = feedbackData;
    const sql = "INSERT INTO feedback (email, message) VALUES (?, ?)";
    db.query(sql, [email, message], callback);
  },

  getAll: (callback) => {
    const sql = "SELECT feedback_id, email, message FROM feedback";
    db.query(sql, callback);
  },

  delete:(feedbackid,cb) => {
    const sql="delete from feedback where feedback_id=?";
    db.query(sql,[feedbackid],cb);
  }
};

module.exports = Feedback;
