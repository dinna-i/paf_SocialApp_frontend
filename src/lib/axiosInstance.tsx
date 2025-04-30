// src/lib/axiosInstance.ts
import axios from 'axios';

const baseURL = 'http://localhost:8084/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // If you're using session-based login (like JSESSIONID cookies)
});

// Add request interceptor to add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle expired token (optional)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; // Redirect to login if token is invalid
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => 
    axiosInstance.post('/auth/signin', { email, password }),
  
  // Add other auth methods as needed
  googleLogin: (token: string) => 
    axiosInstance.post('/auth/google', { token }),
};

export default axiosInstance;