const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import configurations
const db = require('./config/db');
const sessionConfig = require('./config/session');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const acceptedUserRoutes = require('./routes/acceptedUserRoutes');
const otpRoutes = require('./routes/otpRoutes');
const statsRoutes = require('./routes/statsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ 
  credentials: true, 
  origin: ['https://eco-troop.vercel.app', 'http://localhost:3001'] 
}));

app.use(express.json());
app.use(cookieParser());
app.use(sessionConfig); // This adds session support

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/accepted', acceptedUserRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Session check endpoint (for backward compatibility)
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ 
      loggedIn: true, 
      user: req.session.user 
    });
  }
  return res.status(200).json({ 
    loggedIn: false,
    message: 'No active session found'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      sessionAvailable: !!req.session.user 
    });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Test database connection
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database');
  });
});