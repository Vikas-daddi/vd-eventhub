import axios from 'axios';

// ✅ Hardcoded for testing
const API_URL = 'https://vd-eventhub-backend.onrender.com';

// Leave the alert for now
alert('API_URL: ' + API_URL);
console.log('🌐 API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
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
  (error) => Promise.reject(error)
);

export default api;