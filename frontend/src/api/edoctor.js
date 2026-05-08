const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getMyEdoctors = async () => {
  const response = await fetch(`${API_URL}/edoctor/doctors/my_edoctors/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch edoctors');
  }
  const data = await response.json();
  return { data };
};

export const addEdoctor = async (data) => {
  const response = await fetch(`${API_URL}/edoctor/doctors/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create edoctor');
  return response.json();
};

export const updateEdoctor = async (id, data) => {
  const response = await fetch(`${API_URL}/edoctor/doctors/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update edoctor');
  return response.json();
};

export const deleteEdoctor = async (id) => {
  const response = await fetch(`${API_URL}/edoctor/doctors/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete edoctor');
};

export const getEdoctors = async () => {
  const response = await fetch(`${API_URL}/edoctor/doctors/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch edoctors');
  return response.json();
};
