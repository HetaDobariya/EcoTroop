const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock data storage
const mockUsers = [];

// Mock bcrypt
const bcrypt = {
  compare: jest.fn(),
  hash: jest.fn()
};

// Mock JWT
const jwt = {
  verify: jest.fn()
};

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

// User routes

// GET /api/users - Get all users (admin only)
mockApp.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Filter users based on search
    let filteredUsers = mockUsers.filter(user => {
      if (search) {
        return (
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
        );
      }
      return true;
    });
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Remove passwords from response
    const usersWithoutPasswords = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.status(200).json({
      users: usersWithoutPasswords,
      total: filteredUsers.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredUsers.length / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - Get user by ID
mockApp.get('/api/users/:id', authMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check permission - user can view their own profile, admin can view any
    if (user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
mockApp.delete('/api/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Cannot delete yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove user
    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    
    // Remove password from response
    const { password, ...userWithoutPassword } = deletedUser;
    
    return res.status(200).json({
      message: 'User deleted successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset function for tests
const resetMocks = () => {
  mockUsers.length = 0;
  
  // Add some initial test data
  mockUsers.push(
    {
      id: 1,
      email: 'test@example.com',
      password: '$2b$10$hashedpassword123',
      name: 'Test User',
      phone: '1234567890',
      address: '123 Test Street, City',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'admin@example.com',
      password: '$2b$10$hashedpassword456',
      name: 'Admin User',
      phone: '0987654321',
      address: '456 Admin Street, City',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      email: 'user2@example.com',
      password: '$2b$10$hashedpassword789',
      name: 'Another User',
      phone: null,
      address: null,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
};

describe('User API', () => {
  let userToken = 'user-token-123';
  let adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    resetMocks();
    
    // Setup bcrypt mocks
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$2b$10$newhashedpassword');
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(mockApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(3); // Returns all users without pagination limit
      expect(response.body).toHaveProperty('total', 3);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 1);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(mockApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(mockApp)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(mockApp)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should allow admin to view any user', async () => {
      const response = await request(mockApp)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should not allow viewing other users profile', async () => {
      const response = await request(mockApp)
        .get('/api/users/2') // Admin user
        .set('Authorization', `Bearer ${userToken}`); // Regular user token
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user (admin only)', async () => {
      const response = await request(mockApp)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(mockApp)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(mockApp)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should not allow admin to delete their own account', async () => {
      const response = await request(mockApp)
        .delete('/api/users/2') // Admin's own ID
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Cannot delete your own account');
    });
  });
});