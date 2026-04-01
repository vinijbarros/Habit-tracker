import axios from 'axios';
import { clearStoredAuth, loadStoredAuth, saveAuthNotice } from './storage';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

http.interceptors.request.use((config) => {
  const auth = loadStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
      saveAuthNotice(
        error.response?.data?.message || 'Your session is no longer valid. Please sign in again.',
      );

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
