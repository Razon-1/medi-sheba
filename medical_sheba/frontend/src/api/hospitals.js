import client from './client';

export const hospitalsAPI = {
  list: (params = {}) =>
    client.get('/hospitals/', { params }),
  
  get: (id) =>
    client.get(`/hospitals/${id}/`),
  
  create: (data) =>
    client.post('/hospitals/', data),
  
  update: (id, data) =>
    client.put(`/hospitals/${id}/`, data),
  
  delete: (id) =>
    client.delete(`/hospitals/${id}/`),
  
  search: (query) =>
    client.get('/hospitals/search/', { params: { q: query } }),
};
