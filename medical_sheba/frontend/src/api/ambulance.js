import apiClient from './client';

export const ambulanceAPI = {
  // Get all ambulance services
  listServices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
    if (filters.district) params.append('district', filters.district);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    
    return apiClient.get(`/ambulance/services/?${params.toString()}`);
  },

  // Get single ambulance service
  getService: async (id) => {
    return apiClient.get(`/ambulance/services/${id}/`);
  },

  // Filter by vehicle type
  filterByVehicleType: async (type) => {
    return apiClient.get(`/ambulance/services/by_vehicle_type/?type=${type}`);
  },

  // Filter by district
  filterByDistrict: async (districtId) => {
    return apiClient.get(`/ambulance/services/by_district/?district_id=${districtId}`);
  },

  // Get all ambulance requests
  listRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.vehicle_type) params.append('vehicle_type_required', filters.vehicle_type);
    if (filters.urgency) params.append('urgency', filters.urgency);
    
    return apiClient.get(`/ambulance/requests/?${params.toString()}`);
  },

  // Get single request
  getRequest: async (id) => {
    return apiClient.get(`/ambulance/requests/${id}/`);
  },

  // Create new request
  createRequest: async (data) => {
    return apiClient.post('/ambulance/requests/', data);
  },

  // Cancel request
  cancelRequest: async (id) => {
    return apiClient.post(`/ambulance/requests/${id}/cancel/`);
  },

  // Update request status
  updateStatus: async (id, status) => {
    return apiClient.post(`/ambulance/requests/${id}/update_status/`, { status });
  },

  // Accept request (assign ambulance)
  acceptRequest: async (id, ambulanceId) => {
    return apiClient.post(`/ambulance/requests/${id}/accept/`, { ambulance_id: ambulanceId });
  },

  // Hospital admin methods
  myAmbulances: () =>
    apiClient.get('/ambulance/services/my_ambulances/'),
  
  getHospitalAmbulanceRequests: (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiClient.get(`/ambulance/requests/hospital_requests/?${params.toString()}`);
  },
  
  createAmbulance: (data) =>
    apiClient.post('/ambulance/services/', data),
  
  updateAmbulance: (id, data) =>
    apiClient.put(`/ambulance/services/${id}/`, data),
  
  deleteAmbulance: (id) =>
    apiClient.delete(`/ambulance/services/${id}/`),
};

// Convenience functions for hospital admin
export const getMyAmbulances = () => ambulanceAPI.myAmbulances();
export const getHospitalAmbulanceRequests = (status) => ambulanceAPI.getHospitalAmbulanceRequests(status);
export const addAmbulance = (data) => ambulanceAPI.createAmbulance(data);
export const updateAmbulance = (id, data) => ambulanceAPI.updateAmbulance(id, data);
export const deleteAmbulance = (id) => ambulanceAPI.deleteAmbulance(id);
export const getAmbulances = () => ambulanceAPI.listServices();
