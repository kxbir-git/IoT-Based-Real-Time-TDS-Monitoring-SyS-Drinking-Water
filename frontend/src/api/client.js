import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aquasense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('aquasense_token');
      localStorage.removeItem('aquasense_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me:       ()     => api.get('/api/auth/me'),
};

// Readings
export const readingsAPI = {
  list:   (params) => api.get('/api/readings', { params }),
  latest: (deviceId) => api.get('/api/readings/latest', { params: deviceId ? { device_id: deviceId } : {} }),
  ingest: (data)   => api.post('/api/readings', data),
  stats:  ()       => api.get('/api/readings/stats'),
};

// Predict
export const predictAPI = {
  predict: (data) => api.post('/api/predict', data),
};

// Alerts
export const alertsAPI = {
  list:  (limit = 50) => api.get('/api/alerts', { params: { limit } }),
  count: ()           => api.get('/api/alerts/count'),
};

// Devices
export const devicesAPI = {
  list: () => api.get('/api/devices'),
};

export default api;
