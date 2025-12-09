const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'omsomani789@gmail.com',
    pass: process.env.EMAIL_PASSWORD || process.env.password
  }
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send emails');
  } catch (error) {
    console.error('Error with email configuration:', error);
  }
};

// Call the verification function
verifyEmailConfig();

module.exports = transporter;
