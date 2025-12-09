const AcceptedUser = require('../models/acceptedUserModel');
const transporter = require('../config/email');

// Convert ISO date string to MySQL DATETIME format
const toMySQLDatetime = (isoString) => {
  const date = new Date(isoString);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const submitConfirmation = async (req, res) => {
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
  } = req.body;

  try {
    const convertedDate = toMySQLDatetime(date);
    
    AcceptedUser.create({
      pickup_id,
      userid,
      device_name,
      weight,
      contact,
      address,
      date: convertedDate,
      email,
      payment
    }, async (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Failed to insert data' });
      }

      // Format date for email (readable)
      const readableDate = new Date(date).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      const mailOptions = {
        from: 'omsomani789@gmail.com',
        to: email,
        subject: 'Order Successful',
        html: `
📦 Your Order (ID: <strong>${pickup_id}</strong>)<br> 
Devices: ${device_name} ♻️<br> 
Weight: ${weight} KG ⚖️<br> 
Payment: ₹${payment} 💰<br> 

has been picked up successfully on ${readableDate}. ✅ 
Thank you for recycling with us! 🌍 

<p>If you have any feedback, please <a href="https://eco-troop.vercel.app/feedback" target="_blank">click here to fill out the form</a>.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Successfully inserted into accepted_user.' });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(200).json({ 
          message: 'Order processed successfully but failed to send confirmation email.',
          warning: 'Email notification failed'
        });
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const getAllAcceptedUsers = (req, res) => {
  AcceptedUser.getAll((err, data) => {
    if (err) {
      console.error("Error fetching accepted users:", err);
      return res.status(500).json({ error: 'Error fetching accepted users' });
    }
    return res.json(data);
  });
};

const getLatestAcceptedId = (req, res) => {
  AcceptedUser.getLatestId((err, result) => {
    if (err) {
      console.error("Error fetching latest accepted ID:", err);
      return res.status(500).json({ error: 'Error fetching latest ID' });
    }
    res.json({ latestAcceptedId: result[0]?.accepted_id || 0 });
  });
};

const getTotalWeight = (req, res) => {
  AcceptedUser.getTotalWeight((err, result) => {
    if (err) {
      console.error("Error calculating total weight:", err);
      return res.status(500).json({ error: 'Error calculating total weight' });
    }
    res.json({ totalWeight: result[0]?.totalWeight || 0 });
  });
};

const getTotalPayment = (req, res) => {
  AcceptedUser.getTotalPayment((err, result) => {
    if (err) {
      console.error("Error calculating total payment:", err);
      return res.status(500).json({ error: 'Error calculating total payment' });
    }
    res.json({ totalPayment: result[0]?.totalPayment || 0 });
  });
};

const getMonthlyStats = (req, res) => {
  AcceptedUser.getMonthlyStats((err, results) => {
    if (err) {
      console.error("Error fetching monthly stats:", err);
      return res.status(500).json({ error: 'Error fetching monthly statistics' });
    }

    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Convert month numbers to month names
    const formattedResults = results.map(row => ({
      month: months[row.month] || 'Unknown',
      count: row.count
    }));

    res.json(formattedResults);
  });
};

module.exports = {
  submitConfirmation,
  getAllAcceptedUsers,
  getLatestAcceptedId,
  getTotalWeight,
  getTotalPayment,
  getMonthlyStats
};
