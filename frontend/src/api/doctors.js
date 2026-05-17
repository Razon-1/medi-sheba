const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getMyDoctors = async () => {
  const response = await fetch(`${API_URL}/doctors/my_doctors/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch doctors');
  }
  const data = await response.json();
  // Handle both paginated and non-paginated responses
  return Array.isArray(data) ? data : (data.results || data);
};

export const addDoctor = async (data) => {
  // First, create a user if we have user data
  let userData = {
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email,
    phone_number: data.phone_number,
    username: data.email, // Use email as username
    password: Math.random().toString(36).slice(-8), // Generate temporary password
    roles: ['doctor']
  };

  // Create user first
  let userId;
  try {
    const userResponse = await fetch(`${API_URL}/users/create_user/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to create user');
    }
    const user = await userResponse.json();
    userId = user.id;
  } catch (err) {
    throw new Error(`User creation failed: ${err.message}`);
  }

  // Now create the doctor profile with the user_id
  const doctorData = {
    user: userId,
    hospital: data.hospital,
    bmdc_number: data.bmdc_number,
    specialty: data.specialty,
    subspecialty: data.subspecialty || '',
    qualifications: data.qualifications,
    experience_years: parseInt(data.experience_years) || 0,
    consultation_fee: parseFloat(data.consultation_fee),
    follow_up_fee: data.follow_up_fee ? parseFloat(data.follow_up_fee) : null,
    chamber_address: data.chamber_address || '',
    available_days: data.available_days || '',
    available_time_start: data.available_time_start || '',
    available_time_end: data.available_time_end || '',
    bio: data.bio || '',
    is_available: true
  };

  const response = await fetch(`${API_URL}/doctors/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(doctorData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Failed to create doctor');
  }
  return response.json();
};

export const updateDoctor = async (id, data) => {
  const response = await fetch(`${API_URL}/doctors/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update doctor');
  return response.json();
};

export const deleteDoctor = async (id) => {
  const response = await fetch(`${API_URL}/doctors/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete doctor');
};

export const getDoctors = async () => {
  const response = await fetch(`${API_URL}/doctors/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch doctors');
  return response.json();
};
