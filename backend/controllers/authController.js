const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = require('../config/constants');

// User login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    User.findByEmail(email, async (err, results) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const user = results[0];
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.userid, 
          email: user.email,
          role: user.role || 'user' 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Don't send password back
      delete user.password;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.userid,
          name: user.name,
          email: user.email,
          mobile_no: user.mobile_no,
          role: user.role || 'user'
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// User registration
const register = async (req, res) => {
  const { name, email, password, mobile_no } = req.body;

  try {
    // Check if user already exists
    User.findByEmail(email, async (err, results) => {
      if (err) {
        console.error('Database error during registration:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (results.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        name,
        email,
        password: hashedPassword,
        mobile_no,
        role: 'user' // Default role
      };

      User.create(newUser, (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error creating user' 
          });
        }

        // Generate token for new user
        const token = jwt.sign(
          { 
            userId: result.insertId, 
            email: newUser.email,
            role: 'user' 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Don't send password back
        delete newUser.password;

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            id: result.insertId,
            ...newUser
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get current user
const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
  
  // Don't send sensitive data
  const { password, ...userData } = req.user;
  res.status(200).json({ 
    success: true, 
    user: userData 
  });
};

// User logout
const logout = (req, res) => {
  if (req.session.user) {
    req.session.user = null;
  }

  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
};

// Check session
const checkSession = (req, res) => {
  // Check JWT token from cookies
  const token = req.cookies?.auth_token;
  
  if (token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Return user data (similar to old session format)
      return res.status(200).json({ 
        loggedIn: true, 
        user: {
          userId: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          mobile_no: decoded.mobile_no,
          role: decoded.role
        }
      });
    } catch (error) {
      // Token is invalid or expired
      console.error("Token verification failed:", error);
    }
  }
  
  // No valid token found
  return res.status(200).json({ 
    loggedIn: false,
    message: 'No active session found'
  });
};
module.exports = {
  login,
  register,
  getCurrentUser,
  logout,
  checkSession
};
