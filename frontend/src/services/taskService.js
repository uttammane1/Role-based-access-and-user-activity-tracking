import api from './api';

export const taskService = {
  getTasks: (params = {}) => api.get('/tasks', { params }).then((response) => response.data),
  createTask: (task) => api.post('/tasks', task).then((response) => response.data),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task).then((response) => response.data),
  deleteTask: (id) => api.delete(`/tasks/${id}`).then((response) => response.data),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }).then((response) => response.data),
  reassignTask: (id, assignedTo) => api.put(`/tasks/${id}/assign`, { assignedTo }).then((response) => response.data)
};
