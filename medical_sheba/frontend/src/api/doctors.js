import client from './client';

export const doctorsAPI = {
  list: (params = {}) =>
    client.get('/doctors/', { params }),
  
  get: (id) =>
    client.get(`/doctors/${id}/`),
  
  create: (data) =>
    client.post('/doctors/', data),
  
  update: (id, data) =>
    client.put(`/doctors/${id}/`, data),
  
  delete: (id) =>
    client.delete(`/doctors/${id}/`),
  
  search: (query) =>
    client.get('/doctors/search/', { params: { q: query } }),
};
