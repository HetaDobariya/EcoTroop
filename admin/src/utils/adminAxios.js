import axios from 'axios';

const adminAxios = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true, // Send cookies with every request
});

// Request interceptor to add Authorization header if token exists
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userInfo');
      // Redirect to login page
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminAxios;