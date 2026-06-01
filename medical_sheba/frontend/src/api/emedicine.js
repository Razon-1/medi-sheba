import apiClient from './client';

export const emedicineAPI = {
  // Pharmacies
  listPharmacies: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pharmacy_type) params.append('pharmacy_type', filters.pharmacy_type);
    if (filters.district) params.append('district', filters.district);
    if (filters.is_verified) params.append('is_verified', filters.is_verified);
    if (filters.search) params.append('search', filters.search);
    
    return apiClient.get(`/emedicine/pharmacies/?${params.toString()}`);
  },

  getPharmacy: async (id) => {
    return apiClient.get(`/emedicine/pharmacies/${id}/`);
  },

  getMyPharmacy: async () => {
    return apiClient.get('/emedicine/pharmacies/my_pharmacy/');
  },

  createPharmacy: async (data) => {
    return apiClient.post('/emedicine/pharmacies/', data);
  },

  updatePharmacy: async (id, data) => {
    return apiClient.patch(`/emedicine/pharmacies/${id}/`, data);
  },

  // Search keyword: Super Admin Pharmacy CRUD - delete pharmacy from all pharmacies table.
  deletePharmacy: async (id) => {
    return apiClient.delete(`/emedicine/pharmacies/${id}/`);
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
    if (filters.page) params.append('page', filters.page);
    if (filters.medicine_type) params.append('medicine_type', filters.medicine_type);
    if (filters.is_available) params.append('is_available', filters.is_available);
    if (filters.search) params.append('search', filters.search);
    
    return apiClient.get(`/emedicine/medicines/?${params.toString()}`);
  },

  getMedicine: async (id) => {
    return apiClient.get(`/emedicine/medicines/${id}/`);
  },

  getMyMedicines: async () => {
    return apiClient.get('/emedicine/medicines/my_medicines/');
  },

  addMedicine: async (data) => {
    return apiClient.post('/emedicine/medicines/', data);
  },

  updateMedicine: async (id, data) => {
    return apiClient.patch(`/emedicine/medicines/${id}/`, data);
  },

  // Search keyword: Super Admin Medicines CRUD - delete medicine from all medicines table.
  deleteMedicine: async (id) => {
    return apiClient.delete(`/emedicine/medicines/${id}/`);
  },

  // Orders
  // Search keyword: Super Admin Medicine Orders All Pages - supports paginated all-orders loading.
  listOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
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

  updateOrder: async (id, data) => {
    return apiClient.patch(`/emedicine/orders/${id}/`, data);
  },

  // Search keyword: Super Admin Medicine Orders CRUD - delete medicine order from all orders table.
  deleteOrder: async (id) => {
    return apiClient.delete(`/emedicine/orders/${id}/`);
  },

  markMedicineDelivered: async (orderId, medicineName, quantity = 1) => {
    return apiClient.post(`/emedicine/orders/${orderId}/mark_medicine_delivered/`, {
      medicine_name: medicineName,
      quantity: quantity
    });
  },

  unmarkMedicineDelivered: async (orderId, medicineName) => {
    return apiClient.post(`/emedicine/orders/${orderId}/unmark_medicine_delivered/`, {
      medicine_name: medicineName
    });
  },
};

export const medicineAPI = emedicineAPI;
