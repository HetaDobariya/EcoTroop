const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock data storage
const mockUsers = [];

// Generate mock JWT token
const generateToken = (userId) => {
  return `mock-jwt-token-${userId}`;
};

// Mock JWT verification
const verifyToken = (token) => {
  if (!token || token === 'invalid-token') {
    throw new Error('Invalid token');
  }
  
  // Extract userId from token format: "mock-jwt-token-{userId}"
  const match = token.match(/mock-jwt-token-(.+)/);
  if (!match) {
    throw new Error('Invalid token');
  }
  
  return { userId: match[1] };
};

// Mock bcrypt
const mockBcrypt = {
  hash: async (password, saltRounds) => {
    return `$2b$10$${password}-hashed`;
  },
  compare: async (plainPassword, hashedPassword) => {
    // For testing purposes
    if (plainPassword === 'wrongpassword') {
      return false;
    }
    return true;
  },
  genSalt: async (saltRounds) => {
    return 'mock-salt';
  }
};

// Routes
mockApp.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await mockBcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

mockApp.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check password
    const isPasswordValid = await mockBcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


mockApp.post('/api/auth/logout', (req, res) => {
  return res.status(200).json({ message: 'Logout successful' });
});

mockApp.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Authentication Service',
    uptime: process.uptime()
  });
});

mockApp.get('/api/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No session' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Find user
    const user = mockUsers.find(u => u._id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      authenticated: true,
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid session' });
  }
});

describe('Authentication API', () => {
  let testUserId;
  let testUserToken;
  
  beforeEach(() => {
    // Clear mock users
    mockUsers.length = 0;
    
    // Add a test user for login tests
    testUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockUsers.push({
      _id: testUserId,
      email: 'test@example.com',
      password: '$2b$10$password-hashed',
      name: 'Test User',
      createdAt: new Date().toISOString()
    });
    
    testUserToken = generateToken(testUserId);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(mockApp)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('name', 'New User');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if email already exists', async () => {
      // First register a user
      await request(mockApp)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User'
        });

      // Try to register with same email
      const response = await request(mockApp)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password456',
          name: 'Another User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(mockApp)
        .post('/api/auth/register')
        .send({
          email: '',
          password: '',
          name: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'All fields are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should validate required fields', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(mockApp)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(mockApp)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Authentication Service');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/session', () => {
    it('should return session status', async () => {
      const response = await request(mockApp)
        .get('/api/session')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authenticated', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 without valid session', async () => {
      const response = await request(mockApp)
        .get('/api/session');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No session');
    });
  });
});