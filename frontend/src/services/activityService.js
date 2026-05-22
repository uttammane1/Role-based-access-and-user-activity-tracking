import api from './api';

export const activityService = {
  getLogs: (params = {}) => api.get('/activity-logs', { params }).then((response) => response.data),
  getUserLogs: (userId, params = {}) => api.get(`/activity-logs/user/${userId}`, { params }).then((response) => response.data),
  getSummary: (params = {}) => api.get('/activity-logs/analytics/summary', { params }).then((response) => response.data),
  getTrends: (params = {}) => api.get('/activity-logs/analytics/trends', { params }).then((response) => response.data)
};
