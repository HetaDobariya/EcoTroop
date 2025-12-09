const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const login = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    Admin.findByEmail(email, async (err, results) => {
      if (err) {
        console.error('Database error in admin login:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Database error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' // Generic message for security
        });
      }

      const admin = results[0];
      
      try {
        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid email or password' // Generic message for security
          });
        }

        // Generate a JWT token for the admin
        const token = jwt.sign(
          { 
            adminId: admin.adminid, 
            email: admin.email,
            role: 'admin'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '8h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        // Return success response with token and admin data (excluding password)
        const { password: _, ...adminData } = admin;
        
        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          admin: adminData,
          expiresIn: 8 * 60 * 60 // 8 hours in seconds
        });

      } catch (error) {
        console.error('Error in password comparison:', error);
        return res.status(500).json({
          success: false,
          message: 'Authentication error'
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error in admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout handler
const logout = (req, res) => {
  // Clear cookies
  res.clearCookie('auth_token');
  res.clearCookie('user_role');
  res.clearCookie('token'); // Clear old cookie name for compatibility
  
  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
};
// Get current admin profile
const getProfile = (req, res) => {
  // The admin data is attached to the request by the auth middleware
  const { password, ...adminData } = req.admin;
  
  res.status(200).json({
    success: true,
    admin: adminData
  });
};

module.exports = {
  login,
  logout,
  getProfile
};
