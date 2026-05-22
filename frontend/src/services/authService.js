import api from './api';

export const authService = {
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async ({ name, email, password }) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
