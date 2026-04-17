import client from './client';

export const appointmentsAPI = {
  list: (params = {}) =>
    client.get('/appointments/', { params }),
  
  get: (id) =>
    client.get(`/appointments/${id}/`),
  
  create: (data) =>
    client.post('/appointments/', data),
  
  update: (id, data) =>
    client.put(`/appointments/${id}/`, data),
  
  cancel: (id) =>
    client.post(`/appointments/${id}/cancel/`),
  
  delete: (id) =>
    client.delete(`/appointments/${id}/`),
};
