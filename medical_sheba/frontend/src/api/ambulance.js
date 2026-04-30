import apiClient from './client';

export const ambulanceAPI = {
  // Get all ambulance services
  listServices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
    if (filters.district) params.append('district', filters.district);
    if (filters.search) params.append('search', filters.search);
    
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
};
