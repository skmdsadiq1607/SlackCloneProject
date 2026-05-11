import { create } from 'zustand';
import api from '../api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),

  checkAuth: async () => {
    try {
      const res = await api.get('/user/profile');
      set({ user: res.data.payload, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.data.payload, isAuthenticated: true });
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  }
}));
