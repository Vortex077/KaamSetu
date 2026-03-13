import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kaamsetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('kaamsetu_token');
      localStorage.removeItem('kaamsetu_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);

// ---- Workers ----
export const getWorkerProfile = () => api.get('/api/workers/profile');
export const updateWorkerProfile = (data) => api.put('/api/workers/profile', data);
export const getNearbyGigs = (params) => api.get('/api/workers/gigs/nearby', { params });
export const getWorkerApplications = () => api.get('/api/workers/applications');

// ---- Gigs ----
export const createGig = (data) => api.post('/api/gigs', data);
export const getGigMatches = (gigId, params) => api.get(`/api/gigs/${gigId}/matches`, { params });
export const hireWorker = (gigId, workerId) => api.post(`/api/gigs/${gigId}/hire/${workerId}`);
export const acceptGig = (gigId) => api.post(`/api/gigs/${gigId}/accept`);
export const declineGig = (gigId) => api.post(`/api/gigs/${gigId}/decline`);
export const completeGig = (gigId) => api.post(`/api/gigs/${gigId}/complete`);
export const getGigStatus = (gigId) => api.get(`/api/gigs/${gigId}/status`);

// ---- Applications ----
export const applyToGig = (gigId) => api.post('/api/applications', { gigId });
export const getMyApplications = () => api.get('/api/applications/my');

// ---- Reviews ----
export const createReview = (data) => api.post('/api/reviews', data);

export default api;
