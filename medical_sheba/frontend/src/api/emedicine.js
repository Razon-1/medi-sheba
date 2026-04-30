import apiClient from './client';

export const emedicineAPI = {
  // Pharmacies
  listPharmacies: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.pharmacy_type) params.append('pharmacy_type', filters.pharmacy_type);
    if (filters.district) params.append('district', filters.district);
    if (filters.is_verified) params.append('is_verified', filters.is_verified);
    if (filters.search) params.append('search', filters.search);
    
    return apiClient.get(`/emedicine/pharmacies/?${params.toString()}`);
  },

  getPharmacy: async (id) => {
    return apiClient.get(`/emedicine/pharmacies/${id}/`);
  },

  filterByPharmacyType: async (type) => {
    return apiClient.get(`/emedicine/pharmacies/by_pharmacy_type/?type=${type}`);
  },

  filterByDistrict: async (districtId) => {
    return apiClient.get(`/emedicine/pharmacies/by_district/?district_id=${districtId}`);
  },

  verifiedPharmacies: async () => {
    return apiClient.get('/emedicine/pharmacies/verified_only/');
  },

  // Medicines
  listMedicines: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.medicine_type) params.append('medicine_type', filters.medicine_type);
    if (filters.is_available) params.append('is_available', filters.is_available);
    if (filters.search) params.append('search', filters.search);
    
    return apiClient.get(`/emedicine/medicines/?${params.toString()}`);
  },

  getMedicine: async (id) => {
    return apiClient.get(`/emedicine/medicines/${id}/`);
  },

  // Orders
  listOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.urgency) params.append('urgency', filters.urgency);
    if (filters.pharmacy) params.append('pharmacy', filters.pharmacy);
    
    return apiClient.get(`/emedicine/orders/?${params.toString()}`);
  },

  getOrder: async (id) => {
    return apiClient.get(`/emedicine/orders/${id}/`);
  },

  createOrder: async (data) => {
    return apiClient.post('/emedicine/orders/', data);
  },

  confirmOrder: async (id) => {
    return apiClient.post(`/emedicine/orders/${id}/confirm/`);
  },

  cancelOrder: async (id) => {
    return apiClient.post(`/emedicine/orders/${id}/cancel/`);
  },

  updateOrderStatus: async (id, status) => {
    return apiClient.post(`/emedicine/orders/${id}/update_status/`, { status });
  },
};
