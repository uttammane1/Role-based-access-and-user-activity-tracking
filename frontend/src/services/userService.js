import api from './api';

export const userService = {
  getUsers: (params = {}) => api.get('/users', { params }).then((response) => response.data),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }).then((response) => response.data),
  updateUserStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }).then((response) => response.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((response) => response.data)
};
