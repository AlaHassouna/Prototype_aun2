import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set) => ({
  user:  null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    const { data } = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user, loading: false });
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));

export default useAuthStore;
