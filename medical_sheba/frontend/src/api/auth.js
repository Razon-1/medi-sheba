import client from './client';

export const authAPI = {
  login: (email, password, role) =>
    client.post('/users/login/', { email, password, role }),
  
  register: (userData) =>
    client.post('/users/register/', userData),
  
  getCurrentUser: () =>
    client.get('/users/me/'),
};

