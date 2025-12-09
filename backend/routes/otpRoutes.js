const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const transporter = require('../config/email');

// Request OTP for registration
router.post('/request-otp', (req, res) => {
  const { email } = req.body;

  // Check if user already exists
  const checkUser = 'SELECT * FROM user WHERE email = ?';
  db.query(checkUser, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Proceed to send OTP if user does not exist
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 1 * 60 * 1000;

    const deleteOld = 'DELETE FROM otp_verification WHERE email = ?';
    const insertOtp = 'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)';

    db.query(deleteOld, [email], () => {
      db.query(insertOtp, [email, otp, expiresAt], (err) => {
        if (err) return res.status(500).json({ message: 'Error saving OTP' });

        res.json({ message: 'OTP is being sent' });

        transporter.sendMail({
          from: 'omsomani789@gmail.com',
          to: email,
          subject: 'Your OTP',
          html: `<p>🔑 Your OTP is <b>${otp}</b>. Please enter it to verify your identity. 💡</p>
              <p style="color: red; font-weight: bold;">⚠️ Warning: Never share your OTP with anyone. If you did not request this, please contact support immediately.</p>`
        }, (error) => {
          if (error) return res.status(500).json({ message: 'Error sending OTP' });
          else console.log('OTP email sent');
        });
      });
    });
  });
});

// Verify OTP and register user
router.post('/verify-otp', (req, res) => {
  const { email, otp, name, password, mobile_no } = req.body;

  const checkOtp = 'SELECT * FROM otp_verification WHERE email = ? AND otp = ?';
  db.query(checkOtp, [email, otp], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

    const now = Date.now();
    if (results[0].expires_at < now) return res.status(400).json({ message: 'OTP expired' });

    // Password hashing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Password hashing failed' });

      const insertUser = 'INSERT INTO user (name, email, password, mobile_no, date) VALUES (?, ?, ?, ?, ?)';
      const values = [name, email, hashedPassword, mobile_no, new Date()];

      db.query(insertUser, values, (err) => {
        if (err) {
          console.error("Insert user error:", err);
          return res.status(500).json({ message: 'User creation failed', error: err });
        }
        
        // Delete used OTP
        db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Send welcome email
        transporter.sendMail({
          from: 'omsomani789@gmail.com',
          to: email,
          subject: "Registration Successful",
          html: `
            <h2>🌱 Hello ${name},</h2>
            <p>Thank you for registering with ECOTROOP! ♻️ We're excited to have you on board as part of our mission to make e-waste recycling easy and efficient. 😊</p>
            <p>Stay tuned for further updates, and feel free to reach out if you need any assistance!</p>
          `
        }, (error, info) => {
          if (error) {
            console.error('Email error:', error);
            return res.status(500).json({ message: 'User saved but email failed', error });
          }
          console.log('Email sent', info.response);
          return res.json({ message: 'User registered successfully' });
        });
      });
    });
  });
});

// Forgot password - request OTP
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const checkUserQuery = 'SELECT * FROM user WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const deleteOld = 'DELETE FROM otp_verification WHERE email = ?';
    const insertOtp = 'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)';

    db.query(deleteOld, [email], () => {
      db.query(insertOtp, [email, otp, expiresAt], (err) => {
        if (err) return res.status(500).json({ message: 'Error saving OTP' });

        transporter.sendMail({
          from: 'omsomani789@gmail.com',
          to: email,
          subject: 'Password Reset OTP',
          html: `
            <p>Your OTP for password reset is <b>${otp}</b>.</p>
            <p><strong>⚠️ Warning:</strong> For your security, never share your OTP with anyone. ECOTROOP will never ask for your OTP. Keep it private!</p>
          `
        }, (error) => {
          if (error) return res.status(500).json({ message: 'Error sending email' });
          res.json({ message: 'OTP sent to your email' });
        });
      });
    });
  });
});

// Verify OTP for password reset
router.post('/verify-reset-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  db.query(
    'SELECT * FROM otp_verification WHERE email = ? AND otp = ?',
    [email.trim(), otp.trim()],
    (error, results) => {
      if (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (!results || results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // OTP is valid
      return res.status(200).json({ success: true, message: 'OTP verified' });
    }
  );
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email]);
    await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/verify-ottp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  db.query(
    'SELECT * FROM otp_verification WHERE email = ? AND otp = ?',
    [email.trim(), otp.trim()],
    (error, results) => {
      if (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (!results || results.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
      }

      return res.status(200).json({ success: true, message: "OTP verified" });
    }
  );
});

module.exports = router;
