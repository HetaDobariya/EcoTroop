// tests/contact.test.js
const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock data storage
const mockContactSubmissions = [];
let contactIdCounter = 1;

// Mock JWT token generation
const generateToken = (userData) => {
  if (userData && userData.role === 'admin') {
    return 'admin-mock-token-123';
  }
  return 'user-mock-token-456';
};

// Mock user data
const mockUsers = {
  admin: {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  },
  regular: {
    id: 2,
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user'
  }
};

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Simple token validation
  if (token === 'admin-mock-token-123') {
    req.user = mockUsers.admin;
  } else if (token === 'user-mock-token-456') {
    req.user = mockUsers.regular;
  } else {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Contact routes

// POST /api/contact - Submit contact form
mockApp.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    const errors = [];
    if (!name || name.trim() === '') errors.push('Name is required');
    if (!email || email.trim() === '') errors.push('Email is required');
    if (!subject || subject.trim() === '') errors.push('Subject is required');
    if (!message || message.trim() === '') errors.push('Message is required');
    
    // Email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Create contact submission
    const contactSubmission = {
      id: contactIdCounter++,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockContactSubmissions.push(contactSubmission);
    
    return res.status(201).json({
      message: 'Contact form submitted successfully',
      data: contactSubmission
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/contact - Get all contact submissions (admin only)
mockApp.get('/api/contact', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Filter submissions if status is provided
    let filteredSubmissions = [...mockContactSubmissions];
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(sub => sub.status === status);
    }
    
    // Sort by newest first
    filteredSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);
    
    return res.status(200).json({
      submissions: paginatedSubmissions,
      total: filteredSubmissions.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredSubmissions.length / limit)
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/contact/:id - Get specific contact submission
mockApp.get('/api/contact/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    
    const submission = mockContactSubmissions.find(sub => sub.id === submissionId);
    
    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }
    
    return res.status(200).json(submission);
  } catch (error) {
    console.error('Get contact by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset function for tests
const resetMocks = () => {
  mockContactSubmissions.length = 0;
  contactIdCounter = 1;
  
  // Add some initial test data
  mockContactSubmissions.push(
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Question about service',
      message: 'I have a question about your service.',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Feedback',
      message: 'Great service!',
      status: 'read',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
};

describe('Contact API', () => {
  let adminToken;
  
  beforeEach(() => {
    resetMocks();
    adminToken = generateToken(mockUsers.admin);
  });

  describe('POST /api/contact', () => {
    it('should submit a new contact form', async () => {
      const testContact = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await request(mockApp)
        .post('/api/contact')
        .send(testContact);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'Contact form submitted successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Test User');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).toHaveProperty('subject', 'Test Subject');
      expect(response.body.data).toHaveProperty('message', 'This is a test message');
    });

    it('should return 400 for invalid contact data', async () => {
      const response = await request(mockApp)
        .post('/api/contact')
        .send({});
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid email format', async () => {
      const testContact = {
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await request(mockApp)
        .post('/api/contact')
        .send(testContact);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Invalid email format');
    });
  });

  describe('GET /api/contact', () => {
    it('should return all contact submissions (admin only)', async () => {
      const response = await request(mockApp)
        .get('/api/contact')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('submissions');
      expect(Array.isArray(response.body.submissions)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should return 401 without token', async () => {
      const response = await request(mockApp)
        .get('/api/contact');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 403 for non-admin users', async () => {
      const userToken = generateToken(mockUsers.regular);
      const response = await request(mockApp)
        .get('/api/contact')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });

    it('should filter submissions by status', async () => {
      const response = await request(mockApp)
        .get('/api/contact?status=new')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.submissions.every(sub => sub.status === 'new')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(mockApp)
        .get('/api/contact?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.submissions).toHaveLength(1);
      expect(response.body.page).toBe(1);
    });
  });

  describe('GET /api/contact/:id', () => {
    it('should return a specific contact submission', async () => {
      const response = await request(mockApp)
        .get('/api/contact/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('subject');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent submission', async () => {
      const response = await request(mockApp)
        .get('/api/contact/999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact submission not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(mockApp)
        .get('/api/contact/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid submission ID');
    });
  });
});