import client from './client';

export const authAPI = {
  login: (email, password, role) =>
    client.post('/users/login/', { email, password, role }),
  
  register: (userData) =>
    client.post('/users/register/', userData),

  recoverPassword: (data) =>
    client.post('/users/recover_password/', data),

  requestPasswordReset: (email) =>
    client.post('/users/request_password_reset/', { email }),

  confirmPasswordReset: (data) =>
    client.post('/users/confirm_password_reset/', data),
  
  getCurrentUser: () =>
    client.get('/users/me/'),

  listUsers: (params = {}) =>
    client.get('/users/', { params }),

  createUser: (userData) =>
    client.post('/users/', userData),

  updateUser: (id, userData) =>
    client.patch(`/users/${id}/`, userData),

  deleteUser: (id) =>
    client.delete(`/users/${id}/`),
};
