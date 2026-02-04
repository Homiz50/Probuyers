import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055';

const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginCustomer = (credentials) => api.post('/api/leads/customer/login', credentials);
export const getCustomerProfile = (id) => api.get(`/api/leads/customer/${id}`);
export const getAllLeads = () => api.get('/api/leads/admin/all');
export const getFilteredLeads = (params) => api.get('/api/leads/filter', { params });
export const purchaseLead = (data) => api.post('/api/leads/purchase', data);
export const saveLead = (data) => api.post('/api/leads/save-lead', data);

export default api;
