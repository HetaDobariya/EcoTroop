const db = require('../config/db');
const { sendAcceptanceEmail, sendRejectionEmail, sendOrderConfirmationEmail } = require('./emailService');

// Accept pickup request (marks as pending in the UI)
const acceptPickup = (pickupData) => {
  return new Promise((resolve, reject) => {
    const { pickupId } = pickupData;
    
    if (!pickupId) {
      return reject({ success: false, message: 'Pickup ID is required' });
    }
    
    // Get the pickup request details
    db.query('SELECT * FROM pickup_req WHERE pickup_id = ?', [pickupId], async (err, results) => {
      if (err) {
        console.error('Error fetching pickup request:', err);
        return reject({ success: false, message: 'Error fetching pickup request' });
      }

      if (results.length === 0) {
        return reject({ success: false, message: 'Pickup request not found' });
      }

      const { email, device_name, date, userid, contact, address } = results[0];

      try {
        // Send acceptance email with all required parameters
        await sendAcceptanceEmail({
          to: email,
          deviceName: device_name,
          pickupId: pickupId,
          pickupDate: date
        });
        
        // Mark the request as accepted in the frontend (no database change needed here)
        resolve({
          success: true,
          message: 'Pickup marked as pending. Please enter weight and payment details.',
          email,
          device_name,
          pickup_id: pickupId,
          date,
          userid,
          contact,
          address
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Even if email fails, we still consider it accepted
        resolve({
          success: true,
          message: 'Pickup marked as pending but email notification failed to send',
          email,
          device_name,
          pickup_id: pickupId,
          date,
          userid,
          contact,
          address
        });
      }
    });
  });
};

const rejectPickup = (pickupId) => {
  return new Promise((resolve, reject) => {
    // First, get the pickup request details
    db.query('SELECT * FROM pickup_req WHERE pickup_id = ?', [pickupId], async (err, results) => {
      if (err) {
        console.error('Error fetching pickup request:', err);
        return reject({ success: false, message: 'Error fetching pickup request' });
      }

      if (results.length === 0) {
        return reject({ success: false, message: 'Pickup request not found' });
      }

      const { email, device_name } = results[0];

      // Delete the pickup request
      db.query('DELETE FROM pickup_req WHERE pickup_id = ?', [pickupId], async (err) => {
        if (err) {
          console.error('Error deleting pickup request:', err);
          return reject({ success: false, message: 'Error rejecting pickup' });
        }

        try {
          // Send rejection email with all required parameters
          await sendRejectionEmail({
            to: email,
            deviceName: device_name,
            pickupId: pickupId
          });
          resolve({
            success: true,
            message: 'Pickup rejected successfully',
            email,
            deviceName: device_name,
            pickupId
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Even if email fails, the pickup is still rejected
          resolve({
            success: true,
            message: 'Pickup rejected but email notification failed to send',
            email,
            deviceName: device_name,
            pickupId
          });
        }
      });
    });
  });
};

const submitConfirmation = async (pickupData) => {
  const {
    pickup_id,
    userid,
    device_name,
    weight,
    contact,
    address,
    date,
    email,
    payment
  } = pickupData;

  try {
    // Start transaction using the existing connection
    await new Promise((resolve, reject) => {
      db.query('START TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 1. Insert into accepted_user table
    const insertQuery = `
      INSERT INTO accepted_user 
      (pickup_id, userid, device_name, weight, contact, address, date, email, payment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [
        pickup_id,
        userid,
        device_name,
        parseFloat(weight),
        contact,
        address,
        new Date(date).toISOString().slice(0, 19).replace('T', ' '),
        email,
        parseFloat(payment)
      ], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // 2. Delete from pickup_req
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM pickup_req WHERE pickup_id = ?', [pickup_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Commit the transaction
    await new Promise((resolve, reject) => {
      db.query('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Send confirmation email (outside transaction)
    try {
      await sendOrderConfirmationEmail({
        to: email,
        pickupId: pickup_id,
        deviceName: device_name,
        weight: parseFloat(weight),
        payment: parseFloat(payment),
        pickupDate: date
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return { success: true, message: 'Order confirmed successfully' };
  } catch (error) {
    // Rollback the transaction on error
    await new Promise((resolve) => {
      db.query('ROLLBACK', (err) => {
        if (err) console.error('Error rolling back transaction:', err);
        resolve();
      });
    });
    
    console.error('Error in submitConfirmation:', error);
    throw new Error('Failed to confirm order: ' + error.message);
  }
};

module.exports = {
  acceptPickup,
  rejectPickup,
  submitConfirmation
};
