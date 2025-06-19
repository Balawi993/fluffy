import axios from 'axios';
import { getToken, removeToken } from './auth';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Resend API client
export const resendAPI = axios.create({
  baseURL: 'https://api.resend.com',
  headers: {
    'Authorization': 'Bearer re_7bk19qCJ_2frULLzn4rm5AynPZ8KwqQvo',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      console.log('Adding token to request:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('API: 401 Unauthorized - removing token');
      // Token expired or invalid, remove token
      removeToken();
      // Don't redirect here - let ProtectedRoute handle it
      console.log('API: Token removed, letting ProtectedRoute handle navigation');
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions for different resources
export const contactsAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; group?: string }) => 
    api.get('/contacts', { params }),
  create: (data: { name: string; email: string; tags?: string; group?: string }) => 
    api.post('/contacts', data),
  update: (id: string, data: { name?: string; email?: string; tags?: string; group?: string }) => 
    api.put(`/contacts/${id}`, data),
  delete: (id: string) => 
    api.delete(`/contacts/${id}`),
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
};

export const templatesAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/templates', { params }),
  create: (data: { name: string; subject?: string; blocks: any[] }) => 
    api.post('/templates', data),
  update: (id: string, data: { name?: string; subject?: string; blocks?: any[] }) => 
    api.put(`/templates/${id}`, data),
  delete: (id: string) => 
    api.delete(`/templates/${id}`),
};

export const campaignsAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => 
    api.get('/campaigns', { params }),
  create: (data: { name: string; subject: string; sender: string; group: string; blocks: any[]; status?: string }) => 
    api.post('/campaigns', data),
  update: (id: string, data: { name?: string; subject?: string; sender?: string; group?: string; blocks?: any[]; status?: string }) => 
    api.put(`/campaigns/${id}`, data),
  delete: (id: string) => 
    api.delete(`/campaigns/${id}`),
  send: (id: string) => 
    api.post(`/campaigns/${id}/send`),
  sendEmail: (to: string, subject: string, html: string, from: string = "Fluffly <noreply@fluffly.com>") => 
    resendAPI.post('/emails', { from, to, subject, html }),
  trackSentEmail: (data: { campaignId: string, contactId: string, messageId: string, contactEmail: string }) => 
    api.post('/campaigns/track-email', data),
};

export const authAPI = {
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  signup: (data: { fullName: string; email: string; password: string }) => 
    api.post('/auth/signup', data),
  me: () => 
    api.get('/auth/me'),
}; 