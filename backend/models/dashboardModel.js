const db = require('../config/db');

class DashboardModel {
    // Get all accepted users
    static getAllAccepted(callback) {
        const query = 'SELECT * FROM accepted_user';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get latest accepted ID
    static getLatestAcceptedId(callback) {
        const query = 'SELECT accepted_id FROM accepted_user ORDER BY accepted_id DESC LIMIT 1';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]?.accepted_id || 0);
        });
    }

    // Get total weight
    static getTotalWeight(callback) {
        const query = 'SELECT COALESCE(SUM(weight), 0) AS totalWeight FROM accepted_user';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, parseFloat(results[0].totalWeight) || 0);
        });
    }

    // Get total payment
    static getTotalPayment(callback) {
        const query = 'SELECT COALESCE(SUM(payment), 0) AS totalPayment FROM accepted_user';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, parseFloat(results[0].totalPayment) || 0);
        });
    }

    // Get monthly accepted data
    static getMonthlyAccepted(callback) {
        const query = `
            SELECT 
                MONTH(date) AS month,
                COUNT(*) AS count
            FROM accepted_user
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get monthly weight data
    static getMonthlyWeight(callback) {
        const query = `
            SELECT 
                MONTH(date) AS month,
                SUM(weight) AS total_weight
            FROM accepted_user
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get monthly payment data
    static getMonthlyPayment(callback) {
        const query = `
            SELECT 
                MONTH(date) AS month,
                SUM(payment) AS total_payment
            FROM accepted_user
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get recent updates
    static getRecentUpdates(limit = 3, callback) {
        const query = 'SELECT name, date FROM contact ORDER BY contact_id DESC LIMIT ?';
        db.query(query, [limit], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get customer graph data
    static getCustomerGraphData(callback) {
        const query = `
            SELECT 
                MONTH(date) AS month,
                COUNT(*) AS count
            FROM user
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
}

module.exports = DashboardModel;
