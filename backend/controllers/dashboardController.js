const DashboardModel = require('../models/dashboardModel');

// Helper function to handle errors
const handleError = (res, err, message) => {
    console.error(`${message}:`, err);
    return res.status(500).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Get all accepted users
const getAllAccepted = (req, res) => {
    DashboardModel.getAllAccepted((err, data) => {
        if (err) return handleError(res, err, 'Error fetching accepted users');
        res.json(data);
    });
};

// Get latest accepted ID
const getLatestAcceptedId = (req, res) => {
    DashboardModel.getLatestAcceptedId((err, latestId) => {
        if (err) return handleError(res, err, 'Error fetching latest accepted ID');
        res.json({ latestAcceptedId: latestId });
    });
};

// Get total weight
const getTotalWeight = (req, res) => {
    DashboardModel.getTotalWeight((err, totalWeight) => {
        if (err) return handleError(res, err, 'Error fetching total weight');
        res.json({ totalWeight });
    });
};

// Get total payment
const getTotalPayment = (req, res) => {
    DashboardModel.getTotalPayment((err, totalPayment) => {
        if (err) return handleError(res, err, 'Error fetching total payment');
        res.json({ totalPayment });
    });
};

// Get monthly accepted data
const getMonthlyAccepted = (req, res) => {
    DashboardModel.getMonthlyAccepted((err, results) => {
        if (err) return handleError(res, err, 'Error fetching monthly accepted data');
        
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = results.map(row => ({
            month: months[row.month],
            count: row.count
        }));
        
        res.json(data);
    });
};

// Get monthly weight data
const getMonthlyWeight = (req, res) => {
    DashboardModel.getMonthlyWeight((err, results) => {
        if (err) return handleError(res, err, 'Error fetching monthly weight data');
        
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = results.map(row => ({
            month: months[row.month],
            total_weight: row.total_weight
        }));
        
        res.json(data);
    });
};

// Get monthly payment data
const getMonthlyPayment = (req, res) => {
    DashboardModel.getMonthlyPayment((err, results) => {
        if (err) return handleError(res, err, 'Error fetching monthly payment data');
        
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = results.map(row => ({
            month: months[row.month],
            total_payment: row.total_payment
        }));
        
        res.json(data);
    });
};

// Get recent updates
const getRecentUpdates = (req, res) => {
    const limit = parseInt(req.query.limit) || 3;
    
    DashboardModel.getRecentUpdates(limit, (err, updates) => {
        if (err) return handleError(res, err, 'Error fetching recent updates');
        res.json(updates);
    });
};

// Get customer graph data
const getCustomerGraphData = (req, res) => {
    DashboardModel.getCustomerGraphData((err, results) => {
        if (err) return handleError(res, err, 'Error fetching customer graph data');
        
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = results.map(row => ({
            month: months[row.month],
            count: row.count
        }));
        
        res.json(data);
    });
};

module.exports = {
    getAllAccepted,
    getLatestAcceptedId,
    getTotalWeight,
    getTotalPayment,
    getMonthlyAccepted,
    getMonthlyWeight,
    getMonthlyPayment,
    getRecentUpdates,
    getCustomerGraphData
};
