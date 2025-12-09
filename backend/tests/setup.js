// tests/setup.js
const dotenv = require('dotenv');
const path = require('path');

// Load test environment FIRST
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Force test environment
process.env.NODE_ENV = 'test';

// Mock mysql BEFORE anything imports it
jest.mock('mysql', () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockEnd = jest.fn();
  const mockOn = jest.fn();
  
  // Default mock implementation
  mockQuery.mockImplementation((sql, params, callback) => {
    // Default successful empty response
    if (typeof callback === 'function') {
      callback(null, []);
    }
  });
  
  mockConnect.mockImplementation((callback) => callback && callback(null));
  mockEnd.mockImplementation((callback) => callback && callback(null));
  mockOn.mockImplementation((event, callback) => {
    if (event === 'error') {
      // Mock error handler
    }
  });
  
  const mockConnection = {
    query: mockQuery,
    connect: mockConnect,
    end: mockEnd,
    on: mockOn
  };
  
  return {
    createConnection: jest.fn(() => mockConnection)
  };
});

// Mock config/db.js directly
jest.mock('../config/db', () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockEnd = jest.fn();
  
  // Default implementation
  mockQuery.mockImplementation((sql, params, callback) => {
    if (typeof callback === 'function') {
      // Handle common queries
      if (sql.includes('SELECT') && sql.includes('users')) {
        // Return a test user
        callback(null, [{
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          password: '$2b$10$hashedpassword',
          role: 'user',
          phone: '1234567890',
          address: '123 Test St'
        }]);
      } else if (sql.includes('INSERT')) {
        callback(null, { insertId: 1, affectedRows: 1 });
      } else if (sql.includes('UPDATE') || sql.includes('DELETE')) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, []);
      }
    }
  });
  
  mockConnect.mockImplementation((callback) => callback && callback(null));
  mockEnd.mockImplementation((callback) => callback && callback(null));
  
  return {
    query: mockQuery,
    connect: mockConnect,
    end: mockEnd
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('mocked-salt')
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, callback) => {
    if (token && (token === 'valid-token' || token === 'user-token-123' || token === 'admin-token-123')) {
      if (token === 'admin-token-123') {
        if (callback) callback(null, { id: 2, email: 'admin@example.com', role: 'admin' });
        return { id: 2, email: 'admin@example.com', role: 'admin' };
      }
      if (callback) callback(null, { id: 1, email: 'test@example.com', role: 'user' });
      return { id: 1, email: 'test@example.com', role: 'user' };
    }
    if (callback) callback(new Error('Invalid token'));
    throw new Error('Invalid token');
  }),
  sign: jest.fn(() => 'mocked-jwt-token')
}));

// Mock nodemailer COMPLETELY
// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    verify: jest.fn().mockResolvedValue(true),
    verifyConnection: jest.fn().mockResolvedValue(true)
  }))
}));

// Mock express-session
jest.mock('express-session', () => {
  return jest.fn(() => (req, res, next) => {
    req.session = {
      user: null,
      destroy: jest.fn((cb) => cb && cb()),
      save: jest.fn((cb) => cb && cb()),
      regenerate: jest.fn((cb) => cb && cb())
    };
    next();
  });
});

// Mock the email config to prevent SMTP connection
jest.mock('../config/email', () => ({
  transporter: {
    sendMail: jest.fn().mockResolvedValue(true),
    verify: jest.fn().mockResolvedValue(true)
  },
  verifyEmailConfig: jest.fn().mockResolvedValue()
}));

// Global test setup
beforeAll(() => {
  // Mock console to avoid cluttering test output
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});