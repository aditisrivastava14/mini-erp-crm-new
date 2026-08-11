import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginInput, RegisterInput } from '@gigflow/shared';
import api from '../lib/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token: string) => set({ token, isAuthenticated: !!token }),

      login: async (data: LoginInput) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', data);
          const { user, accessToken } = res.data.data;
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterInput) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, accessToken } = res.data.data;
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout failed on server', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
