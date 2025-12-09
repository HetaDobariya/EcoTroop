const Pickup = require('../models/pickupModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { sendEmail } = require('../services/emailService');
const { acceptPickup, rejectPickup } = require('../services/pickupService');

const createPickup = (req, res) => {
  // Check JWT authentication instead of session
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized: Please login first" 
    });
  }

  let { devices, estimate_weight, contact, email, datetime, address } = req.body;
  const userid = req.user.userId; // Use from JWT token instead of session

  // Validate required fields
  if (!devices || !estimate_weight || !contact || !email || !datetime || !address) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // If `devices` is a string, parse it into an array
    if (typeof devices === 'string') {
      devices = JSON.parse(devices);
    }

    // Ensure `devices` is an array before calling `.map()`
    if (!Array.isArray(devices)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid devices format" 
      });
    }

    // Extract values and join them into a string
    const deviceNames = devices.map(device => {
      if (device.type === 'Other' && device.other) {
        return device.other;
      }
      return device.type || '';
    }).filter(name => name.trim() !== '').join(", ");

    // Create pickup request
    Pickup.create({
      userid,
      device_name: deviceNames,
      estimate_weight,
      contact,
      email,
      date: datetime,
      address
    }, (err, result) => {
      if (err) {
        console.error("Error inserting pickup request:", err);
        return res.status(500).json({
          success: false,
          message: "Database error while creating pickup request"
        });
      }
      
      // Send confirmation email
      const emailContent = `
        <h2>♻️ Pickup Request Received</h2>
        <p>Your pickup request for devices: <strong>${deviceNames}</strong> has been received successfully!</p>
        <p>You'll receive an email notification about whether your request is accepted or not.</p>
        <p>Thank you for helping the environment! 🌍</p>
      `;
      
      // Optional: Send email confirmation
      if (sendEmail) {
        sendEmail(email, 'Pickup Request Received', '', emailContent)
          .catch(emailError => {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
          });
      }
        
      return res.status(200).json({ 
        success: true,
        message: "Pickup Request Submitted Successfully!",
        pickupId: result.insertId
      });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(400).json({ 
      success: false,
      message: "Invalid input or devices format" 
    });
  }
};


const getAllPickups = (req, res) => {
  Pickup.getAll((err, data) => {
    if (err) {
      console.error("Error fetching pickup requests:", err);
      return res.status(500).json({ error: 'Error fetching pickup requests' });
    }
    return res.json(data);
  });
};

const acceptPickupRequest = async (req, res) => {
  try {
    const result = await acceptPickup(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error accepting pickup:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Failed to accept pickup' 
    });
  }
};

const rejectPickupRequest = async (req, res) => {
  const { pickupId, email, deviceName } = req.body;
  
  if (!pickupId || !email || !deviceName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  try {
    const result = await rejectPickup(pickupId, email, deviceName);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error rejecting pickup:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Failed to reject pickup' 
    });
  }
};

module.exports = {
  createPickup,
  getAllPickups,
  acceptPickupRequest,
  rejectPickupRequest
};
