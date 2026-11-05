import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbanpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      // localStorage.removeItem('urbanpulse_token');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const complaintService = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  upvote: (id) => api.post(`/complaints/${id}/upvote`),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
};

export const teamService = {
  getAll: (params) => api.get('/teams', { params }),
  assign: (data) => api.post('/teams/assign', data),
};

export const infrastructureService = {
  getAll: (params) => api.get('/infrastructure', { params }),
  getById: (id) => api.get(`/infrastructure/${id}`),
  evaluatePredictiveMaintenance: (id) => api.post(`/infrastructure/${id}/predictive-maintenance`),
};

export const notificationService = {
  getMy: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  getForComplaint: (complaintId) => api.get(`/feedback/${complaintId}`),
};

export default api;
