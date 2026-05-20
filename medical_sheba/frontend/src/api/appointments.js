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
  
  cancel: (id, reason = '') =>
    client.post(`/appointments/${id}/cancel/`, { reason }),
  
  delete: (id) =>
    client.delete(`/appointments/${id}/`),

  // Hospital admin functions
  hospitalAppointments: (status = null) => {
    let url = '/appointments/hospital_appointments/';
    if (status) {
      url += `?status=${status}`;
    }
    return client.get(url);
  },

  confirm: (id, appointmentDate = null, appointmentTime = null) => {
    const data = {};
    if (appointmentDate) data.appointment_date = appointmentDate;
    if (appointmentTime) data.appointment_time = appointmentTime;
    return client.post(`/appointments/${id}/confirm/`, data);
  },

  complete: (id) =>
    client.post(`/appointments/${id}/complete/`),
};
