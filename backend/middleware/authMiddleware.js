const jwt = require('jsonwebtoken');
const db = require('../config/db');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT Token (checks both header and cookies)
const verifyToken = (req, res, next) => {
    try {
        let token;
        
        // 1. Check Authorization header first
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        // 2. Check cookies - BOTH 'auth_token' AND 'token' for compatibility
        else if (req.cookies) {
            token = req.cookies.auth_token || req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                isAuthenticated: false,
                message: 'No token provided' 
            });
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    isAuthenticated: false,
                    message: 'Token expired' 
                });
            }
            return res.status(401).json({ 
                success: false,
                isAuthenticated: false,
                message: 'Invalid token' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false,
            isAuthenticated: false,
            message: 'Authentication error' 
        });
    }
};

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                success: false,
                isAuthenticated: false,
                message: 'Not authorized as admin' 
            });
        }
    });
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyUser: verifyToken // Simplify - verifyUser is same as verifyToken
};