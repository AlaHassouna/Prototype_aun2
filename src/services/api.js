import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Public endpoints
export const publicApi = {
  getSections: () => api.get('/sections'),
  getGallery:  () => api.get('/gallery'),
  getTimeline: () => api.get('/timeline'),
  getSettings: () => api.get('/settings'),
  submitRsvp:  (data) => api.post('/rsvp', data),
  trackView:   () => api.post('/analytics/pageview'),
};

// Admin endpoints
export const authApi = {
  login:          (data)     => api.post('/auth/login', data),
  me:             ()         => api.get('/auth/me'),
  changePassword: (data)     => api.put('/auth/change-password', data),
};

export const sectionsApi = {
  getAll:  () => api.get('/sections'),
  getOne:  (key) => api.get(`/sections/${key}`),
  update:  (key, data) => api.put(`/sections/${key}`, data),
};

export const settingsApi = {
  getAll:  () => api.get('/settings'),
  updateAll: (data) => api.put('/settings', data),
};

export const galleryApi = {
  getAll:  () => api.get('/gallery'),
  create:  (fd) => api.post('/gallery', fd),
  update:  (id, data) => api.put(`/gallery/${id}`, data),
  reorder: (ids) => api.put('/gallery/reorder', { ids }),
  remove:  (id) => api.delete(`/gallery/${id}`),
};

export const timelineApi = {
  getAll:  () => api.get('/timeline'),
  create:  (data) => api.post('/timeline', data),
  update:  (id, data) => api.put(`/timeline/${id}`, data),
  reorder: (ids) => api.put('/timeline/reorder', { ids }),
  remove:  (id) => api.delete(`/timeline/${id}`),
};

export const rsvpApi = {
  getAll:      (params) => api.get('/rsvp', { params }),
  stats:       () => api.get('/rsvp/stats'),
  exportExcel: () => api.get('/rsvp/export/excel', { responseType: 'blob' }),
  exportPdf:   () => api.get('/rsvp/export/pdf',   { responseType: 'blob' }),
  remove:      (id) => api.delete(`/rsvp/${id}`),
};

export const mediaApi = {
  getAll:  (params) => api.get('/media', { params }),
  upload:  (fd) => api.post('/media/upload', fd),
  remove:  (id) => api.delete(`/media/${id}`),
};

export const usersApi = {
  getAll:        () => api.get('/users'),
  create:        (data) => api.post('/users', data),
  update:        (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
  remove:        (id) => api.delete(`/users/${id}`),
};

export const analyticsApi = {
  summary: () => api.get('/analytics/summary'),
};
