const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get monthly weight data for graph
router.get('/monthly-weight', (req, res) => {
  const sql = `
    SELECT 
      MONTH(date) AS month,
      SUM(weight) AS total_weight
    FROM accepted_user
    GROUP BY MONTH(date)
    ORDER BY MONTH(date);
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const data = results.map(row => ({
      month: months[row.month],
      total_weight: row.total_weight
    }));

    res.json(data);
  });
});

// Get monthly payment data for graph
router.get('/monthly-payment', (req, res) => {
  const sql = `
    SELECT 
      MONTH(date) AS month,
      SUM(payment) AS total_payment
    FROM accepted_user
    GROUP BY MONTH(date)
    ORDER BY MONTH(date);
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const data = results.map(row => ({
      month: months[row.month],
      total_payment: row.total_payment
    }));

    res.json(data);
  });
});

// Get customer registration graph data
router.get('/customer-graph', (req, res) => {
  const sql = `
    SELECT 
      MONTH(date) AS month,
      COUNT(*) AS count
    FROM user
    GROUP BY MONTH(date)
    ORDER BY MONTH(date)
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const data = results.map(row => ({
      month: months[row.month],
      count: row.count
    }));

    res.json(data);
  });
});

// Get recent updates
router.get('/updates', (req, res) => {
  const sql = "SELECT name, date FROM contact ORDER BY contact_id DESC LIMIT 3";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

module.exports = router;
