const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getMyAmbulances = async () => {
  const response = await fetch(`${API_URL}/ambulance/services/my_ambulances/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch ambulances');
  }
  const data = await response.json();
  // Handle both paginated and non-paginated responses
  return Array.isArray(data) ? data : (data.results || data);
};

export const addAmbulance = async (data) => {
  const response = await fetch(`${API_URL}/ambulance/services/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create ambulance');
  return response.json();
};

export const updateAmbulance = async (id, data) => {
  const response = await fetch(`${API_URL}/ambulance/services/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update ambulance');
  return response.json();
};

export const deleteAmbulance = async (id) => {
  const response = await fetch(`${API_URL}/ambulance/services/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete ambulance');
};

export const getAmbulances = async () => {
  const response = await fetch(`${API_URL}/ambulance/services/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch ambulances');
  return response.json();
};

// Ambulance Request Management for Hospital Admins
export const getHospitalAmbulanceRequests = async (status = null) => {
  let url = `${API_URL}/ambulance/requests/hospital_requests/`;
  if (status) {
    url += `?status=${status}`;
  }
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch ambulance requests');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : (data.results || data);
};

export const acceptAmbulanceRequest = async (requestId, ambulanceId) => {
  const response = await fetch(`${API_URL}/ambulance/requests/${requestId}/accept/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ambulance_id: ambulanceId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to accept ambulance request');
  }
  return response.json();
};

export const updateAmbulanceRequestStatus = async (requestId, status) => {
  const response = await fetch(`${API_URL}/ambulance/requests/${requestId}/update_status/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to update ambulance request status');
  }
  return response.json();
};

export const cancelAmbulanceRequest = async (requestId) => {
  const response = await fetch(`${API_URL}/ambulance/requests/${requestId}/cancel/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to cancel ambulance request');
  }
  return response.json();
};
