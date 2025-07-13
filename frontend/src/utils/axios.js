import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true,
});

// List of endpoints that don't need CSRF tokens
const NO_CSRF_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register', 
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp'
];

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if this endpoint needs CSRF protection
    const needsCSRF = config.method !== 'get' && 
                     config.method !== 'head' && 
                     config.method !== 'options' &&
                     !NO_CSRF_ENDPOINTS.some(endpoint => config.url?.includes(endpoint));
    
    if (needsCSRF) {
      try {
        // Use a separate axios instance to avoid recursive interceptor calls
        const csrfAxios = axios.create({ 
          baseURL: instance.defaults.baseURL, 
          withCredentials: true 
        });
        
        const response = await csrfAxios.get('/api/csrf-token');

        if (response?.data?.csrfToken) {
          config.headers['X-CSRF-Token'] = response.data.csrfToken;
        } else {
          console.error('Invalid CSRF token response:', response);
          return Promise.reject(new Error('Failed to retrieve a valid CSRF token.'));
        }
      } catch (err) {
        console.error('CSRF token fetch error:', err);
        return Promise.reject(err);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        store.dispatch(logout());
        window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        // If it's a CSRF error, just log it and let the component handle it
        if (error.response.data?.message?.includes('CSRF')) {
          console.error('CSRF validation failed:', error.response.data.message);
        }
        // Redirect to dashboard if trying to access admin routes
        else if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/dashboard';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;