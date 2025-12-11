// client/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token to headers
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

// Interceptor to handle global unauthorized errors (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const isLogin = originalRequest.url === '/auth/login';

    if (status === 401 && !isLogin) {
      console.error("Session expired or unauthorized request. Forcing re-authentication.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; 
      return Promise.resolve();
    }
    return Promise.reject(error);
  }
);

export default api;