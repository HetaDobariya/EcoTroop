// config/constants.js
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  TOKEN_EXPIRY: '24h' // Token expiration time
};