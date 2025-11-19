import axios from 'axios';
import { getToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('Network or CORS error', error);
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      clearAuth();
      console.warn('Unauthorized, logging out...');
    } else if (status >= 500) {
      console.error('Server error', error.response);
    }

    return Promise.reject(error);
  }
);

export default api;
