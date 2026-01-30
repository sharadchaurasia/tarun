import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; tenantName: string }) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: accessToken, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    const { accessToken, user } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));
