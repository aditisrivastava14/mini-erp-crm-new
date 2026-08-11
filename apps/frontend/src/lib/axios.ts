import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { API_PREFIX } from '@gigflow/shared';

const api = axios.create({

  baseURL: `${import.meta.env.VITE_API_URL}${API_PREFIX}`,

  timeout: 10000,

  withCredentials: true,

});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || API_PREFIX}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        useAuthStore.getState().setToken(newAccessToken);
        
        // Update the failed request and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export default api;
