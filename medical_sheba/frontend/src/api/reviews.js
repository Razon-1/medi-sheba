import client from './client';

export const reviewsAPI = {
  list: (params = {}) =>
    client.get('/reviews/', { params }),
  
  getByDoctor: (doctorId) =>
    client.get('/reviews/', { params: { doctor: doctorId } }),
  
  create: (data) =>
    client.post('/reviews/', data),
  
  update: (id, data) =>
    client.put(`/reviews/${id}/`, data),
  
  partial_update: (id, data) =>
    client.patch(`/reviews/${id}/`, data),
  
  delete: (id) =>
    client.delete(`/reviews/${id}/`),
  
  markHelpful: (id) =>
    client.post(`/reviews/${id}/mark_helpful/`),
};
