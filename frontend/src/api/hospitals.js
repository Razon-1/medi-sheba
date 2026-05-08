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
    try {
      const errorData = await response.json();
      throw new Error(`[${response.status}] ${errorData.error || errorData.detail || 'Failed to fetch hospital'}`);
    } catch (e) {
      throw new Error(`[${response.status}] Failed to fetch hospital`);
    }
  }
  const data = await response.json();
  return { data };
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
