const session = require('express-session');
require('dotenv').config();

const sessionConfig = session({
  secret: process.env.secret_key,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 15 * 60 * 1000 }  // Session expires in 15 minutes
});

module.exports = sessionConfig;
