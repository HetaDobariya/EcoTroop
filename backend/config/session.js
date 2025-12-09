const session = require('express-session');
require('dotenv').config();


const sessionConfig = session({
  secret: process.env.secret_key,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 15 * 60 * 1000,   // 15 minutes
    secure: true,    // TRUE in production (HTTPS)
    httpOnly: true,          // protect against XSS
    sameSite: "none"
  }
});

module.exports = sessionConfig;
