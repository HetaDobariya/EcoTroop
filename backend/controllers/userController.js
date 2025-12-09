const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, TOKEN_EXPIRY } = require('../config/constants');

// Get all users (admin only)
const getAllUsers = (req, res) => {
  // Only allow admins to access all users
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }

  const sql = "SELECT userid, name, email, mobile_no, date FROM user";
  
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching users' 
      });
    }
    return res.json({
      success: true,
      users: data
    });
  });
};

// Get user profile
const getUserProfile = (req, res) => {
  const userId = req.user.userId;
  
  User.findById(userId, (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching user profile' 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const user = results[0];
    // Don't send password hash
    delete user.password;
    
    res.json({
      success: true,
      user
    });
  });
};

// Update user profile
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, email, mobile_no, currentPassword, newPassword } = req.body;

  try {
    // First, verify current password if changing password
    if (newPassword) {
      const user = await new Promise((resolve, reject) => {
        User.findById(userId, (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user with new password
      await new Promise((resolve, reject) => {
        User.update(userId, {
          name: name || user.name,
          email: email || user.email,
          mobile_no: mobile_no || user.mobile_no,
          password: hashedPassword
        }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Update without changing password
      await new Promise((resolve, reject) => {
        User.update(userId, {
          name: name || req.user.name,
          email: email || req.user.email,
          mobile_no: mobile_no || req.user.mobile_no
        }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Get updated user data
    User.findById(userId, (err, results) => {
      if (err) throw err;
      
      const user = results[0];
      delete user.password;
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Delete a user (admin only)
const deleteUser = (req, res) => {
  // Only allow admins to delete users
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to perform this action'
    });
  }

  const userId = req.params.id;
  
  // Prevent deleting own account
  if (parseInt(userId) === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }
  
  // First, check if user exists
  User.findById(userId, (err, results) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error finding user' 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Delete the user
    User.delete(userId, (err) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Error deleting user' 
        });
      }
      
      res.status(200).json({ 
        success: true,
        message: 'User deleted successfully' 
      });
    });
  });
};

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, mobile_no } = req.body;
  
  try {
    // Check if user already exists
    User.findByEmail(email, async (err, results) => {
      if (err) {
        console.error("Database error during registration:", err);
        return res.status(500).json({ 
          success: false,
          message: 'Database error during registration' 
        });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: 'User with this email already exists' 
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user with hashed password
      User.create({
        name,
        email,
        password: hashedPassword,
        mobile_no
      }, (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ 
            success: false,
            message: 'Error creating user' 
          });
        }
        
        // Prepare user data
        const userData = {
          userId: result.insertId,
          name,
          email,
          mobile_no,
          role: 'user'
        };

        // Create JWT token
        const token = jwt.sign(
          userData,
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRY }
        );

        // Set token as HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
        });

        // Set role cookie
        res.cookie('user_role', 'user', {
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
        });
        
        res.status(201).json({ 
          success: true,
          message: 'User registered successfully',
          token: token, // Also send in response for flexibility
          user: {
            userid: result.insertId,
            name,
            email,
            mobile_no,
            role: 'user'
          }
        });
      });
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during registration' 
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      isAuthenticated: false,
      message: 'Email and password are required'
    });
  }

  try {
    // Check if user exists
    User.findByEmail(email, async (err, results) => {
      if (err) {
        console.error("Database error during login:", err);
        return res.status(500).json({ 
          success: false,
          isAuthenticated: false,
          message: 'Database error during login' 
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ 
          success: false,
          isAuthenticated: false,
          message: 'Invalid email or password' 
        });
      }

      const user = results[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          isAuthenticated: false,
          message: 'Invalid email or password' 
        });
      }

      // Prepare user data for token
      const userData = {
        userId: user.userid,
        name: user.name,
        email: user.email,
        mobile_no: user.mobile_no,
        role: user.role || 'user' // Default to 'user' if role is not set
      };

      // Create JWT token
      const token = jwt.sign(
        userData,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      // Set token as HTTP-only cookie (secure for production)
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true, // Use HTTPS in production
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Also set a separate cookie for client-side access if needed
      res.cookie('user_role', user.role || 'user', {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Log user activity
      const loginTime = new Date();
      User.logActivity({
        userid: user.userid,
        name: user.name,
        email: user.email,
        mobile_no: user.mobile_no,
        login_time: loginTime
      }, (err) => {
        if (err) {
          console.error("Error logging user activity:", err);
          // Don't fail login if activity logging fails
        }
      });

      // Also send token in response body for flexibility
      res.status(200).json({
        success: true,
        isAuthenticated: true,
        message: 'Login successful',
        token: token, // Keep this for mobile apps or SPA that want to store in localStorage
        tokenType: 'Bearer',
        expiresIn: TOKEN_EXPIRY,
        user: userData
      });
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false,
      isAuthenticated: false,
      message: 'Internal server error during login' 
    });
  }
};

// Logout user (clear cookies)
const logoutUser = (req, res) => {
  // Clear authentication cookies
  res.clearCookie('auth_token');
  res.clearCookie('user_role');
  
  // Also clear session if it exists (for backward compatibility)
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateProfile,
  deleteUser,
  registerUser,
   loginUser,
   logoutUser 
};
