import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { storage } from './chromeStorage';

const env = import.meta.env;

/** Marketing site — Buy me a coffee / support links only. */
export const WEB_BASE =
  (typeof env !== 'undefined' && env.VITE_WEB_URL) || 'http://localhost:3001';

export function webUrl(path = '/') {
  const base = WEB_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const API_BASE = 
  (typeof env !== 'undefined' && env.VITE_API_URL) || 'http://localhost:3000';

export function apiUrl(path = '/') {
  const base = API_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

// Create centralized Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
apiClient.interceptors.request.use(async (config) => {
  try {
    const data = await storage.local.get('authToken');
    if (data.authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${data.authToken}`;
    }
  } catch (err) {
    console.error('Failed to get auth token from storage:', err);
  }
  return config;
});

// Response interceptor to unwrap data and handle global errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If the backend wraps data in { success, data }, unwrap it
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    let message = 'An unknown error occurred';
    
    if (error.response?.data) {
       const data = error.response.data as any;
       if (data.message) {
         message = Array.isArray(data.message) ? data.message[0] : data.message;
       } else if (data.data?.message) {
         message = data.data.message;
       }
    } else if (error.message) {
       message = error.message;
    }
    
    error.message = message;
    return Promise.reject(error);
  }
);
