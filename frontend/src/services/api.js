import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updatePassword: (passwordData) => api.put('/auth/update-password', passwordData),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  addUser: (userData) => api.post('/admin/users', userData),
  getStores: (params) => api.get('/admin/stores', { params }),
  addStore: (storeData) => api.post('/admin/stores', storeData),
};

export const userAPI = {
  getStores: (params) => api.get('/user/stores', { params }),
  getStoreDetails: (id) => api.get(`/user/stores/${id}`),
  submitRating: (ratingData) => api.post('/user/ratings', ratingData),
};

export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
  getStoreRatings: (storeId) => api.get(`/owner/stores/${storeId}/ratings`),
};

export default api;
