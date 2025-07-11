import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
   withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a dedicated function to get the token, so we don't have to deal with async logic inside the interceptor.
let csrfToken = null;
const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;
    try {
        const { data } = await api.get('/csrf-token');
        csrfToken = data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Could not fetch CSRF token:', error);
        return null;
    }
};

// Add a request interceptor to include the auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET requests
    if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase())) {
        // if we are calling csrf-token, we dont need to add the token
        if (config.url === '/csrf-token') return config;
        const csrf = await getCsrfToken();
        if (csrf) {
            config.headers['X-CSRF-Token'] = csrf;
        }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Potentially clear CSRF token as well
      csrfToken = null;
      window.location.href = '/login';
    }
    // if the CSRF token is invalid, clear it so we can fetch a new one
    if (error.response?.status === 403 && error.response?.data?.message === 'CSRF token validation failed') {
        csrfToken = null;
    }
    return Promise.reject(error);
  }
);

// Initial fetch of CSRF token when the app loads
getCsrfToken();
export default api; 