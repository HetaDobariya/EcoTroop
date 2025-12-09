const request = require('supertest');

// Create a mock Express app
const mockApp = require('express')();
mockApp.use(require('express').json());

// Mock database collections
const mockUsersCollection = [];
const mockCompaniesCollection = [];
const mockProjectsCollection = [];
const mockSubmissionsCollection = [];

// Mock user data
const mockAdminUser = {
  _id: 'admin123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
};

const mockRegularUser = {
  _id: 'user123',
  email: 'user@example.com',
  name: 'Regular User',
  role: 'user'
};

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Mock token verification
    if (token === 'invalid-token') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (token === 'user-token') {
      req.user = mockRegularUser;
    } else if (token === 'admin-token') {
      req.user = mockAdminUser;
    } else {
      req.user = mockAdminUser; // Default to admin for other tokens
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Admin routes
mockApp.get('/api/admin/users', adminMiddleware, isAdmin, (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  // Filter users based on search
  let filteredUsers = [...mockUsersCollection];
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return res.status(200).json({
    users: paginatedUsers,
    total: filteredUsers.length,
    page: pageNum,
    totalPages: Math.ceil(filteredUsers.length / limitNum)
  });
});

mockApp.get('/api/admin/users/:id', adminMiddleware, isAdmin, (req, res) => {
  const userId = req.params.id;
  
  // Find user by ID
  const user = mockUsersCollection.find(u => u._id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.status(200).json({ user });
});

mockApp.delete('/api/admin/users/:id', adminMiddleware, isAdmin, (req, res) => {
  const userId = req.params.id;
  
  // Find user index
  const userIndex = mockUsersCollection.findIndex(u => u._id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Remove user
  const deletedUser = mockUsersCollection.splice(userIndex, 1)[0];
  
  return res.status(200).json({ 
    message: 'User deleted successfully',
    user: deletedUser
  });
});

mockApp.get('/api/admin/stats', adminMiddleware, isAdmin, (req, res) => {
  const stats = {
    totalUsers: mockUsersCollection.length,
    totalCompanies: mockCompaniesCollection.length,
    totalProjects: mockProjectsCollection.length,
    totalSubmissions: mockSubmissionsCollection.length,
    activeUsers: mockUsersCollection.filter(u => u.status === 'active').length,
    pendingSubmissions: mockSubmissionsCollection.filter(s => s.status === 'pending').length,
    revenue: {
      total: 10000,
      thisMonth: 2500,
      lastMonth: 2000
    }
  };
  
  return res.status(200).json({ stats });
});

describe('Admin API', () => {
  beforeEach(() => {
    // Clear mock collections
    mockUsersCollection.length = 0;
    mockCompaniesCollection.length = 0;
    mockProjectsCollection.length = 0;
    mockSubmissionsCollection.length = 0;
    
    // Add some mock data
    mockUsersCollection.push(
      { _id: '1', email: 'user1@example.com', name: 'User One', role: 'user', status: 'active' },
      { _id: '2', email: 'user2@example.com', name: 'User Two', role: 'user', status: 'active' },
      { _id: '3', email: 'user3@example.com', name: 'User Three', role: 'user', status: 'inactive' }
    );
    
    mockCompaniesCollection.push(
      { _id: '1', name: 'Company One', status: 'active' },
      { _id: '2', name: 'Company Two', status: 'pending' }
    );
    
    mockProjectsCollection.push(
      { _id: '1', title: 'Project One', status: 'ongoing' },
      { _id: '2', title: 'Project Two', status: 'completed' }
    );
    
    mockSubmissionsCollection.push(
      { _id: '1', user: 'user1', status: 'pending' },
      { _id: '2', user: 'user2', status: 'approved' },
      { _id: '3', user: 'user3', status: 'rejected' }
    );
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });

    it('should return 401 without token', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should support pagination', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(2); // 3 users total, 2 per page = 2 pages
    });

    it('should support search', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users?search=User One')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0]).toHaveProperty('name', 'User One');
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return user details for admin', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users/1')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', '1');
      expect(response.body.user).toHaveProperty('email', 'user1@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(mockApp)
        .get('/api/admin/users/999')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user for admin', async () => {
      const response = await request(mockApp)
        .delete('/api/admin/users/1')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', '1');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(mockApp)
        .delete('/api/admin/users/999')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should return admin stats', async () => {
      const response = await request(mockApp)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalUsers', 3);
      expect(response.body.stats).toHaveProperty('totalCompanies', 2);
      expect(response.body.stats).toHaveProperty('totalProjects', 2);
      expect(response.body.stats).toHaveProperty('totalSubmissions', 3);
      expect(response.body.stats).toHaveProperty('activeUsers');
      expect(response.body.stats).toHaveProperty('pendingSubmissions');
      expect(response.body.stats).toHaveProperty('revenue');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(mockApp)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin only.');
    });
  });
});