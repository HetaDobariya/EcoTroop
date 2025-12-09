const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock data storage
const mockPickups = [];
let pickupIdCounter = 1;

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

// Valid waste types
const VALID_WASTE_TYPES = ['electronics', 'plastic', 'paper', 'metal', 'glass', 'organic', 'hazardous', 'mixed'];
const VALID_STATUSES = ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled', 'rejected'];

// Pickup routes

// POST /api/pickup - Create pickup request
mockApp.post('/api/pickup', authMiddleware, (req, res) => {
  try {
    const { wasteType, quantity, pickupDate, address, notes } = req.body;
    
    // Validation
    const errors = [];
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      errors.push('Quantity must be a positive number');
    }
    
    if (!pickupDate || pickupDate.trim() === '') {
      errors.push('Pickup date is required');
    } else {
      const date = new Date(pickupDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid pickup date format');
      } else if (date < new Date()) {
        errors.push('Pickup date cannot be in the past');
      }
    }
    
    if (!address || address.trim() === '') {
      errors.push('Address is required');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Create pickup
    const pickup = {
      id: pickupIdCounter++,
      userId: req.user.id,
      userEmail: req.user.email,
      wasteType: wasteType ? wasteType.trim() : 'mixed',
      quantity: parseInt(quantity),
      pickupDate: pickupDate.trim(),
      address: address.trim(),
      notes: notes ? notes.trim() : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockPickups.push(pickup);
    
    return res.status(201).json({
      message: 'Pickup request created successfully',
      pickup: pickup
    });
  } catch (error) {
    console.error('Create pickup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pickup - Get user's pickup requests
mockApp.get('/api/pickup', authMiddleware, (req, res) => {
  try {
    const userPickups = mockPickups.filter(pickup => pickup.userId === req.user.id);
    
    // Sort by newest first
    userPickups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json(userPickups);
  } catch (error) {
    console.error('Get user pickups error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pickup/all - Get all pickups (admin only)
mockApp.get('/api/pickup/all', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    
    // Filter pickups by status if provided
    let filteredPickups = mockPickups.filter(pickup => {
      if (status && status.trim() !== '') {
        return pickup.status === status.trim();
      }
      return true;
    });
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    
    const paginatedPickups = filteredPickups.slice(startIndex, endIndex);
    
    // Sort by newest first
    const sortedPickups = paginatedPickups.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return res.status(200).json({
      pickups: sortedPickups,
      total: filteredPickups.length,
      page: pageNum,
      totalPages: Math.ceil(filteredPickups.length / limitNum)
    });
  } catch (error) {
    console.error('Get all pickups error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pickup/:id - Get specific pickup
mockApp.get('/api/pickup/:id', authMiddleware, (req, res) => {
  try {
    const pickupId = parseInt(req.params.id);
    
    if (isNaN(pickupId)) {
      return res.status(400).json({ error: 'Invalid pickup ID' });
    }
    
    const pickup = mockPickups.find(p => p.id === pickupId);
    
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }
    
    // Check permission
    if (pickup.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.status(200).json(pickup);
  } catch (error) {
    console.error('Get pickup by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/pickup/:id - Cancel pickup request
mockApp.delete('/api/pickup/:id', authMiddleware, (req, res) => {
  try {
    const pickupId = parseInt(req.params.id);
    
    if (isNaN(pickupId)) {
      return res.status(400).json({ error: 'Invalid pickup ID' });
    }
    
    const pickupIndex = mockPickups.findIndex(p => p.id === pickupId);
    
    if (pickupIndex === -1) {
      return res.status(404).json({ error: 'Pickup not found' });
    }
    
    const pickup = mockPickups[pickupIndex];
    
    // Check permission
    if (pickup.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if pickup can be cancelled
    if (pickup.status === 'completed' || pickup.status === 'cancelled') {
      return res.status(400).json({ 
        error: `Cannot cancel pickup with status: ${pickup.status}` 
      });
    }
    
    // Update status to cancelled
    mockPickups[pickupIndex].status = 'cancelled';
    mockPickups[pickupIndex].updatedAt = new Date().toISOString();
    
    return res.status(200).json({
      message: 'Pickup cancelled successfully',
      pickup: mockPickups[pickupIndex]
    });
  } catch (error) {
    console.error('Cancel pickup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset function for tests
const resetMocks = () => {
  mockPickups.length = 0;
  pickupIdCounter = 1;
  
  // Add some initial test data
  mockPickups.push(
    {
      id: 1,
      userId: 1,
      userEmail: 'test@example.com',
      wasteType: 'electronics',
      quantity: 2,
      pickupDate: '2025-12-15',
      address: '123 Test Street, City',
      notes: 'Please call before coming',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      userId: 1,
      userEmail: 'test@example.com',
      wasteType: 'plastic',
      quantity: 5,
      pickupDate: '2025-12-20',
      address: '456 Another Street, City',
      notes: null,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      userId: 999, // Different user
      userEmail: 'other@example.com',
      wasteType: 'paper',
      quantity: 3,
      pickupDate: '2025-12-25',
      address: '789 Other Street, City',
      notes: 'Leave at door',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
};

describe('Pickup API', () => {
  let userToken = 'user-token-123';
  let adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    resetMocks();
  });

  describe('POST /api/pickup', () => {
    it('should create pickup request', async () => {
      const pickupData = {
        wasteType: 'electronics',
        quantity: 2,
        pickupDate: '2025-12-15',
        address: '123 Test Street, City',
        notes: 'Please call before coming'
      };

      const response = await request(mockApp)
        .post('/api/pickup')
        .set('Authorization', `Bearer ${userToken}`)
        .send(pickupData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Pickup request created successfully');
      expect(response.body.pickup).toHaveProperty('status', 'pending');
      expect(response.body.pickup).toHaveProperty('userId', 1);
      expect(response.body.pickup).toHaveProperty('wasteType', 'electronics');
    });

    it('should validate required fields', async () => {
      const response = await request(mockApp)
        .post('/api/pickup')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate pickup date not in past', async () => {
      const response = await request(mockApp)
        .post('/api/pickup')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          wasteType: 'electronics',
          quantity: 1,
          pickupDate: '2020-01-01', // Past date
          address: '123 St'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Pickup date cannot be in the past');
    });
  });

  describe('GET /api/pickup', () => {
    it('should return user pickup requests', async () => {
      const response = await request(mockApp)
        .get('/api/pickup')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // User has 2 pickups
      expect(response.body.every(p => p.userId === 1)).toBe(true);
    });
  });

  describe('GET /api/pickup/all', () => {
    it('should return all pickups for admin', async () => {
      const response = await request(mockApp)
        .get('/api/pickup/all')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pickups');
      expect(response.body).toHaveProperty('total', 3);
      expect(Array.isArray(response.body.pickups)).toBe(true);
      expect(response.body.pickups.length).toBe(3); // All 3 pickups (limit is 10, so all fit)
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 1);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(mockApp)
        .get('/api/pickup/all')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });
  });

  describe('GET /api/pickup/:id', () => {
    it('should return specific pickup', async () => {
      const response = await request(mockApp)
        .get('/api/pickup/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('userId', 1);
    });

    it('should not allow viewing other users pickup', async () => {
      const response = await request(mockApp)
        .get('/api/pickup/3') // Pickup belongs to user 999
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should allow admin to view any pickup', async () => {
      const response = await request(mockApp)
        .get('/api/pickup/3')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 3);
    });
  });

  describe('DELETE /api/pickup/:id', () => {
    it('should cancel pickup request', async () => {
      const response = await request(mockApp)
        .delete('/api/pickup/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Pickup cancelled successfully');
      expect(response.body.pickup).toHaveProperty('status', 'cancelled');
    });

    it('should not cancel completed pickups', async () => {
      // Update pickup 2 to completed
      mockPickups[1].status = 'completed';
      
      const response = await request(mockApp)
        .delete('/api/pickup/2')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Cannot cancel pickup with status: completed');
    });

    it('should not allow other users to cancel', async () => {
      const response = await request(mockApp)
        .delete('/api/pickup/3') // Belongs to user 999
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
    });
  });
});