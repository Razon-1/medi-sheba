import client from './client';

export const bloodAPI = {
  // Donors
  listDonors: (params = {}) =>
    client.get('/blood/donors/', { params }),
  
  getDonor: (id) =>
    client.get(`/blood/donors/${id}/`),
  
  createDonor: (data) =>
    client.post('/blood/donors/', data),
  
  updateDonor: (id, data) =>
    client.put(`/blood/donors/${id}/`, data),
  
  deleteDonor: (id) =>
    client.delete(`/blood/donors/${id}/`),
  
  // Requests
  listRequests: (params = {}) =>
    client.get('/blood/requests/', { params }),
  
  getRequest: (id) =>
    client.get(`/blood/requests/${id}/`),
  
  createRequest: (data) =>
    client.post('/blood/requests/', data),
  
  updateRequest: (id, data) =>
    client.put(`/blood/requests/${id}/`, data),
  
  deleteRequest: (id) =>
    client.delete(`/blood/requests/${id}/`),
  
  fulfillRequest: (id) =>
    client.post(`/blood/requests/${id}/fulfill/`),
};

