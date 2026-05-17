import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Add token and handle Content-Type for requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If data is FormData, let axios set the Content-Type with boundary
  if (config.data instanceof FormData) {
    // Don't set Content-Type, let browser handle it
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    // For non-FormData requests, use JSON
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Handle response errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
