const transporter = require('../config/email');

const sendRejectionEmail = (email, device_name, pickup_id) => {
  const mailOptions = {
    from: 'omsomani789@gmail.com',
    to: email,
    subject: 'Pickup Request Rejected',
    text: `❌ Your pickup request ID: ${pickup_id} for device "${device_name}" has been rejected. 🚫 Please check if the device is eligible for recycling or contact us for further assistance.`,
  };

  return transporter.sendMail(mailOptions);
};

const sendAcceptanceEmail = (email, device_name, pickup_id, date) => {
  const formattedDate = new Date(date).toLocaleString('en-IN', {
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
    subject: 'Pickup Request Accepted',
    text: `✅ Your pickup request (ID: <strong>${pickup_id}</strong>) for device "${device_name}" has been accepted! 🎉 Our team will reach you on ${formattedDate}. 📅 Thank you for recycling with us!`,
  };

  return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = (email, name) => {
  const mailOptions = {
    from: 'omsomani789@gmail.com',
    to: email,
    subject: 'Welcome to ECOTROOP',
    html: `
      <h2>🌱 Hello ${name},</h2>
      <p>Thank you for registering with ECOTROOP! ♻️ We're excited to have you on board as part of our mission to make e-waste recycling easy and efficient. 😊</p>
      <p>Stay tuned for further updates, and feel free to reach out if you need any assistance!</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendRejectionEmail,
  sendAcceptanceEmail,
  sendWelcomeEmail
};
