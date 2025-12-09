const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock data storage
const mockFeedback = [];
let feedbackIdCounter = 1;


// Authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Mock token verification
    if (token === 'user-token-123') {
      req.user = { id: 1, email: 'test@example.com', role: 'user' };
    } else if (token === 'admin-token-123') {
      req.user = { id: 2, email: 'admin@example.com', role: 'admin' };
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Feedback routes

// POST /api/feedback - Submit feedback
mockApp.post('/api/feedback', (req, res) => {
  try {
    const { email, message, rating, pickupId } = req.body;
    
    // Validation
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }
    
    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create feedback
    const feedback = {
      id: feedbackIdCounter++,
      email: email.trim(),
      message: message.trim(),
      rating: parseInt(rating),
      pickupId: pickupId ? parseInt(pickupId) : null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockFeedback.push(feedback);
    
    return res.status(201).json({
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/feedback - Get all feedback with filters
mockApp.get('/api/feedback', (req, res) => {
  try {
    const { pickupId, email, page = 1, limit = 10 } = req.query;
    
    // Filter feedback
    let filteredFeedback = [...mockFeedback];
    
    if (pickupId) {
      const pickupIdNum = parseInt(pickupId);
      if (!isNaN(pickupIdNum)) {
        filteredFeedback = filteredFeedback.filter(f => f.pickupId === pickupIdNum);
      }
    }
    
    if (email) {
      filteredFeedback = filteredFeedback.filter(f => 
        f.email.toLowerCase().includes(email.toLowerCase())
      );
    }
    
    // Sort by newest first
    filteredFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFeedback = filteredFeedback.slice(startIndex, endIndex);
    
    return res.status(200).json({
      feedback: paginatedFeedback,
      total: filteredFeedback.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredFeedback.length / limit)
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/feedback/:id - Delete feedback (admin only)
mockApp.delete('/api/feedback/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    
    if (isNaN(feedbackId)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }
    
    const feedbackIndex = mockFeedback.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Remove feedback
    const deletedFeedback = mockFeedback.splice(feedbackIndex, 1)[0];
    
    return res.status(200).json({
      message: 'Feedback deleted successfully',
      data: deletedFeedback
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset function for tests
const resetMocks = () => {
  mockFeedback.length = 0;
  feedbackIdCounter = 1;
  
  // Add some initial test data
  mockFeedback.push(
    {
      id: 1,
      email: 'test@example.com',
      message: 'Excellent service! Very professional team.',
      rating: 5,
      pickupId: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'user2@example.com',
      message: 'Good service, but could be faster.',
      rating: 4,
      pickupId: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      email: 'user3@example.com',
      message: 'Average experience.',
      rating: 3,
      pickupId: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
};

describe('Feedback API', () => {
  let userToken = 'user-token-123';
  let adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    resetMocks();
  });

  describe('POST /api/feedback', () => {
    it('should submit feedback successfully', async () => {
      const feedbackData = {
        email: 'test@example.com',
        message: 'Excellent service! Very professional team.',
        rating: 5,
        pickupId: 1
      };

      const response = await request(mockApp)
        .post('/api/feedback')
        .send(feedbackData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Feedback submitted successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).toHaveProperty('message', 'Excellent service! Very professional team.');
      expect(response.body.data).toHaveProperty('rating', 5);
      expect(response.body.data).toHaveProperty('pickupId', 1);
    });

    it('should require email field', async () => {
      const response = await request(mockApp)
        .post('/api/feedback')
        .send({
          message: 'Good service',
          rating: 4
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email is required');
    });

    it('should require message field', async () => {
      const response = await request(mockApp)
        .post('/api/feedback')
        .send({
          email: 'test@example.com',
          rating: 4
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Message is required');
    });

    it('should validate rating range (1-5)', async () => {
      const response = await request(mockApp)
        .post('/api/feedback')
        .send({
          email: 'test@example.com',
          message: 'Test',
          rating: 6 // Invalid
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Rating must be a number between 1 and 5');
    });

    it('should validate email format', async () => {
      const response = await request(mockApp)
        .post('/api/feedback')
        .send({
          email: 'invalid-email',
          message: 'Test message',
          rating: 4
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid email format');
    });
  });

  describe('GET /api/feedback', () => {
    it('should return all feedback', async () => {
      const response = await request(mockApp).get('/api/feedback');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('feedback');
      expect(Array.isArray(response.body.feedback)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should filter by pickupId', async () => {
      const response = await request(mockApp)
        .get('/api/feedback?pickupId=1');
      
      expect(response.status).toBe(200);
      expect(response.body.feedback.every(f => f.pickupId === 1)).toBe(true);
    });

    it('should filter by email', async () => {
      const response = await request(mockApp)
        .get('/api/feedback?email=test@example.com');
      
      expect(response.status).toBe(200);
      expect(response.body.feedback.every(f => 
        f.email.toLowerCase().includes('test@example.com')
      )).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(mockApp)
        .get('/api/feedback?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.feedback).toHaveLength(2);
      expect(response.body.page).toBe(1);
    });
  });

  describe('DELETE /api/feedback/:id', () => {
    it('should delete feedback (admin only)', async () => {
      const response = await request(mockApp)
        .delete('/api/feedback/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Feedback deleted successfully');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent feedback', async () => {
      const response = await request(mockApp)
        .delete('/api/feedback/999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Feedback not found');
    });
  });
});