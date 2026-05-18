const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getMyHospital = async () => {
  const response = await fetch(`${API_URL}/hospitals/my_hospital/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData ? (errorData.error || errorData.detail || 'Failed to fetch hospital') : 'Failed to fetch hospital';
    const error = new Error(`[${response.status}] ${message}`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  // Handle both single object and paginated responses
  return Array.isArray(data) ? data[0] : (data.results ? data.results[0] : data);
};

export const updateHospital = async (id, data) => {
  const response = await fetch(`${API_URL}/hospitals/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update hospital');
  return response.json();
};

export const getHospitals = async () => {
  const response = await fetch(`${API_URL}/hospitals/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch hospitals');
  return response.json();
};

export const createHospital = async (data) => {
  const response = await fetch(`${API_URL}/hospitals/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || 'Failed to create hospital');
  }
  return response.json();
};
