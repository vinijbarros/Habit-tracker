import axios from 'axios';
import { loadStoredAuth } from './storage';

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
