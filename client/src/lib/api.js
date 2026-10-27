import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
let cleanBaseUrl = rawApiUrl.trim().replace(/\/+$/, '');
if (!cleanBaseUrl.endsWith('/api')) {
    cleanBaseUrl = `${cleanBaseUrl}/api`;
}

const api = axios.create({ baseURL: cleanBaseUrl });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
