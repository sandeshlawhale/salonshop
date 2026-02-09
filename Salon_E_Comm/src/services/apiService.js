import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: add the token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: handle token expiration or errors
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

// Auth Endpoints
export const authAPI = {
    login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        return res;
    },
    register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        return res;
    },
    me: () => api.get('/auth/me'),
};

// Product Endpoints
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return api.post('/products', data, { headers });
    },
    update: (id, data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return api.patch(`/products/${id}`, data, { headers });
    },
    delete: (id) => api.delete(`/products/${id}`),
};

// Order Endpoints
export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getMyOrders: (params) => api.get('/orders/me', { params }),
    getAssigned: (params) => api.get('/orders/assigned', { params }),
    assignAgent: (orderId, agentId) => api.patch(`/orders/${orderId}/assign-agent`, { agentId }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Category Endpoints
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    create: (name) => api.post('/categories', { name }),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Commission Endpoints
export const commissionAPI = {
    getAll: (params) => api.get('/commissions', { params }),
    getMyCommissions: () => api.get('/commissions/me'),
};

// User Endpoints
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getAgents: () => api.get('/users/agents'),
    getById: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    createInternal: (data) => api.post('/users', data),
};

// Notification Endpoints
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getCount: () => api.get('/notifications/unread-count'),
};

// Payment Endpoints (Razorpay)
export const paymentAPI = {
    createOrder: (data) => api.post('/payments/create-order', data),
    verify: (data) => api.post('/payments/verify', data),
};

// Agent Endpoints
export const agentAPI = {
    getDashboard: () => api.get('/agent/dashboard'),
    getSalons: () => api.get('/agent/salons'),
    registerSalonOwner: (data) => userAPI.createInternal({ ...data, role: 'SALON_OWNER' }),
    requestPayout: (amount) => api.post('/agent/payout-request', { amount }),
    getPayouts: () => api.get('/agent/payouts'),
};

// Admin Endpoints
export const adminAPI = {
    getPayoutRequests: () => api.get('/admin/payouts'),
    approvePayout: (id) => api.post(`/admin/payouts/${id}/approve`),
    createAgent: (data) => userAPI.createInternal({ ...data, role: 'AGENT' }),
    getSlabs: () => api.get('/admin/commission-slabs'),
    createSlab: (data) => api.post('/admin/commission-slabs', data),
    updateSlab: (id, data) => api.put(`/admin/commission-slabs/${id}`, data),
};

// Cart Endpoints
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    update: (productId, quantity) => api.patch(`/cart/${productId}`, { quantity }),
    remove: (productId) => api.delete(`/cart/${productId}`),
    clear: () => api.delete('/cart'),
};

// Payout Endpoints
export const payoutAPI = {
    getAll: (params) => api.get('/admin/payouts', { params }), // This was previously loosely in adminAPI
    updateStatus: (id, status) => api.patch(`/admin/payouts/${id}/status`, { status }),
};

export default api;
