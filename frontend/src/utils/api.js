import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor to handle errors
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

// Auth API
export const authAPI = {
  rootLogin: (credentials) => api.post('/auth/root/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  userLogin: (credentials) => api.post('/auth/user/login', credentials),
  userRegister: (data) => api.post('/auth/user/register', data),
  adminRegister: (data) => api.post('/auth/admin/register', data),
};

// Challenge API
export const challengeAPI = {
  getTemplates: () => api.get('/challenges/templates'),
  create: (data) => api.post('/challenges', data),
  getAll: (params) => api.get('/challenges', { params }),
  getById: (id) => api.get(`/challenges/${id}`),
  update: (id, data) => api.put(`/challenges/${id}`, data),
  publish: (id) => api.post(`/challenges/${id}/publish`),
  duplicate: (id) => api.post(`/challenges/${id}/duplicate`),
  archive: (id) => api.post(`/challenges/${id}/archive`),
  delete: (id) => api.delete(`/challenges/${id}`),
  getPublic: (adminId) => api.get('/challenges/public/list', { params: { admin_id: adminId } }),
};

// Ticket API
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  createAdminToRoot: (data) => api.post('/tickets/admin-to-root', data),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getAdminTickets: (params) => api.get('/tickets/admin-tickets', { params }),
  getRootTickets: (params) => api.get('/tickets/root-tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  addMessage: (id, data) => api.post(`/tickets/${id}/messages`, data),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  assign: (id, assignedTo) => api.patch(`/tickets/${id}/assign`, { assigned_to: assignedTo }),
  getStats: (params) => api.get('/tickets/stats/overview', { params }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getChallenges: () => api.get('/user/challenges'),
  getCertificates: () => api.get('/user/certificates'),
  getReferrals: () => api.get('/user/referrals'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  getBranding: () => api.get('/admin/branding'),
  updateBranding: (data) => api.put('/admin/branding', data),
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  approvePayout: (id) => api.post(`/admin/payouts/${id}/approve`),
  rejectPayout: (id, reason) => api.post(`/admin/payouts/${id}/reject`, { reason }),
};

// Root Admin API
export const rootAPI = {
  getDashboard: () => api.get('/root/dashboard'),
  getAdmins: (params) => api.get('/root/admins', { params }),
  createAdmin: (data) => api.post('/root/admins', data),
  updateAdmin: (id, data) => api.put(`/root/admins/${id}`, data),
  suspendAdmin: (id) => api.post(`/root/admins/${id}/suspend`),
  activateAdmin: (id) => api.post(`/root/admins/${id}/activate`),
  getPlans: () => api.get('/root/plans'),
  createPlan: (data) => api.post('/root/plans', data),
  updatePlan: (id, data) => api.put(`/root/plans/${id}`, data),
  getCommissions: (params) => api.get('/root/commissions', { params }),
};

export default api;
