import client from './client';

export const bloodAPI = {
  list: (params = {}) =>
    client.get('/blood/', { params }),
  
  get: (id) =>
    client.get(`/blood/${id}/`),
  
  create: (data) =>
    client.post('/blood/', data),
  
  update: (id, data) =>
    client.put(`/blood/${id}/`, data),
  
  delete: (id) =>
    client.delete(`/blood/${id}/`),
  
  search: (query) =>
    client.get('/blood/search/', { params: { q: query } }),
};
