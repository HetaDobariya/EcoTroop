const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'omsomani789@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: 'omsomani789@gmail.com',
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

const sendAcceptanceEmail = async ({ to, deviceName, pickupId, pickupDate }) => {
  if (!to || !deviceName || !pickupId || !pickupDate) {
    console.error('Missing required parameters for sendAcceptanceEmail:', { to, deviceName, pickupId, pickupDate });
    throw new Error('Missing required email parameters');
  }
  
  const formattedDate = new Date(pickupDate).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = 'Pickup Request Accepted';
  const text = `✅ Your pickup request (ID: ${pickupId}) for device "${deviceName}" has been accepted! 🎉 Our team will reach you on ${formattedDate}. 📅 Thank you for recycling with us!`;
  
  return sendEmail(to, subject, text, '');
};

const sendRejectionEmail = async ({ to, deviceName, pickupId }) => {
  const subject = 'Pickup Request Rejected';
  const text = `❌ Your pickup request ID: ${pickupId} for device "${deviceName}" has been rejected. 🚫 Please check if the device is eligible for recycling or contact us for further assistance.`;
  
  return sendEmail(to, subject, text, '');
};

const sendOrderConfirmationEmail = async ({ 
  to, 
  pickupId, 
  deviceName, 
  weight, 
  payment, 
  pickupDate 
}) => {
  const formattedDate = new Date(pickupDate).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = 'Order Successful';
  const html = `
    <h2>📦 Your Order (ID: <strong>${pickupId}</strong>)</h2>
    <p>Devices: ${deviceName} ♻️<br>
    Weight: ${weight} KG ⚖️<br>
    Payment: ₹${payment} 💰<br>
    has been picked up successfully on ${formattedDate}. ✅</p>
    <p>Thank you for recycling with us! 🌍</p>
    <p>If you have any feedback, please <a href="https://eco-troop.vercel.app/feedback" target="_blank">click here to fill out the form</a>.</p>
  `;
  
  return sendEmail(to, subject, '', html);
};

module.exports = {
  sendEmail,
  sendAcceptanceEmail,
  sendRejectionEmail,
  sendOrderConfirmationEmail
};
