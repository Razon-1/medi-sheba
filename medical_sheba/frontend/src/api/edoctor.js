import apiClient from './client';

// Doctor endpoints
export const edoctorAPI = {
  // Doctors
  listDoctors: (filters = {}) => 
    apiClient.get('/edoctor/doctors/', { params: filters }),
  
  getDoctor: (id) => 
    apiClient.get(`/edoctor/doctors/${id}/`),
  
  getDoctorsBySpecialization: (specialization) =>
    apiClient.get('/edoctor/doctors/by_specialization/', {
      params: { specialization }
    }),
  
  getVerifiedDoctors: () =>
    apiClient.get('/edoctor/doctors/verified_only/'),
  
  getTopRatedDoctors: () =>
    apiClient.get('/edoctor/doctors/top_rated/'),
  
  getAvailableNow: () =>
    apiClient.get('/edoctor/doctors/available_now/'),

  // Consultation Slots
  listSlots: (filters = {}) =>
    apiClient.get('/edoctor/slots/', { params: filters }),
  
  getSlot: (id) =>
    apiClient.get(`/edoctor/slots/${id}/`),

  // Consultations
  listConsultations: (filters = {}) =>
    apiClient.get('/edoctor/consultations/', { params: filters }),
  
  getConsultation: (id) =>
    apiClient.get(`/edoctor/consultations/${id}/`),
  
  createConsultation: (data) =>
    apiClient.post('/edoctor/consultations/', data),
  
  confirmConsultation: (id) =>
    apiClient.post(`/edoctor/consultations/${id}/confirm/`),
  
  cancelConsultation: (id) =>
    apiClient.post(`/edoctor/consultations/${id}/cancel/`),
  
  startConsultation: (id) =>
    apiClient.post(`/edoctor/consultations/${id}/start_consultation/`),
  
  completeConsultation: (id) =>
    apiClient.post(`/edoctor/consultations/${id}/complete/`),
  
  addNotes: (id, data) =>
    apiClient.patch(`/edoctor/consultations/${id}/add_notes/`, data),
  
  updateConsultationStatus: (id, status) =>
    apiClient.patch(`/edoctor/consultations/${id}/`, { status }),

  updateConsultation: (id, data) =>
    apiClient.patch(`/edoctor/consultations/${id}/`, data),

  // Hospital admin methods
  myEdoctors: () =>
    apiClient.get('/edoctor/doctors/my_edoctors/'),
  
  createEdoctor: (data) =>
    apiClient.post('/edoctor/doctors/', data),
  
  updateEdoctor: (id, data) =>
    apiClient.put(`/edoctor/doctors/${id}/`, data),
  
  deleteEdoctor: (id) =>
    apiClient.delete(`/edoctor/doctors/${id}/`),
  
  hospitalConsultations: (status = null) => {
    let url = '/edoctor/consultations/hospital_consultations/';
    if (status) {
      url += `?status=${status}`;
    }
    return apiClient.get(url);
  },
};

// Convenience functions for hospital admin
export const getMyEdoctors = () => edoctorAPI.myEdoctors();
export const addEdoctor = (data) => edoctorAPI.createEdoctor(data);
export const updateEdoctor = (id, data) => edoctorAPI.updateEdoctor(id, data);
export const deleteEdoctor = (id) => edoctorAPI.deleteEdoctor(id);
export const getEdoctors = () => edoctorAPI.listDoctors();

export default edoctorAPI;
