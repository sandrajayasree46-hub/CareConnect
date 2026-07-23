import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/login', { email, password });
    return res.data.data; // { token, user }
  },

  register: async (payload) => {
    const res = await api.post('/register', payload);
    return res.data.data; // { token, user }
  },

  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data.data;
  },

  updateProfile: async (payload) => {
    const res = await api.put('/profile', payload);
    return res.data.data;
  },
};
