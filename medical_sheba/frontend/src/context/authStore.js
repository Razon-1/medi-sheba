import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const { data } = await authAPI.register(userData);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null });
  },

  initializeAuth: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ user: JSON.parse(user), loading: false });
    } else {
      set({ loading: false });
    }
  },
}));

export default useAuthStore;
