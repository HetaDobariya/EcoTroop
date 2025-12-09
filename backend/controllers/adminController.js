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
  try {
    // Log incoming cookies for debugging
    console.log('Cookies before logout:', req.cookies || 'No cookies found');
    
    // Define cookie options that MATCH how cookies were set
    const cookieOptions = {
      secure:true, // Most important - must match setting path
      httpOnly: true, // If your cookies are httpOnly
      sameSite: 'lax', // or 'strict' based on your setup
      // If using HTTPS in production, uncomment:
      // secure: process.env.NODE_ENV === 'production',
      // If using a domain, include it (for subdomains):
      // domain: '.yourdomain.com',
    };

    // Clear ALL possible auth cookies with explicit options
    res.clearCookie('auth_token', cookieOptions);
    res.clearCookie('user_role', cookieOptions);
    res.clearCookie('token', cookieOptions);
    
    // Clear any other potential auth cookies
    const authCookieNames = [
      'refresh_token',
      'session_id',
      'admin_token',
      'access_token',
      'Authorization'
    ];
    
    authCookieNames.forEach(cookieName => {
      res.clearCookie(cookieName, cookieOptions);
    });
    
    // Also check actual cookies in request and clear them
    if (req.cookies) {
      Object.keys(req.cookies).forEach(cookieName => {
        if (cookieName.toLowerCase().includes('auth') || 
            cookieName.toLowerCase().includes('token') || 
            cookieName.toLowerCase().includes('session') ||
            cookieName.toLowerCase().includes('admin')) {
          res.clearCookie(cookieName, cookieOptions);
        }
      });
    }

    // Destroy session if exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        } else {
          console.log('Session destroyed successfully');
        }
      });
    }

    // Prevent caching of logout response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log successful logout
    console.log('Logout completed for admin');
    
    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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
