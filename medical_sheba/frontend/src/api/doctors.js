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

  // Search keyword: Super Admin Doctors CRUD - partial update for all doctors table.
  patch: (id, data) =>
    client.patch(`/doctors/${id}/`, data),
  
  delete: (id) =>
    client.delete(`/doctors/${id}/`),
  
  search: (query) =>
    client.get('/doctors/search/', { params: { q: query } }),
  
  myDoctors: () =>
    client.get('/doctors/my_doctors/'),
};

// Convenience functions for hospital admin
export const getMyDoctors = () => doctorsAPI.myDoctors();
export const addDoctor = (data) => doctorsAPI.create(data);
export const updateDoctor = (id, data) => doctorsAPI.update(id, data);
export const patchDoctor = (id, data) => doctorsAPI.patch(id, data);
export const deleteDoctor = (id) => doctorsAPI.delete(id);
export const getDoctors = () => doctorsAPI.list();
