import client from './client';

export const authAPI = {
  login: (email, password) =>
    client.post('/users/login/', { email, password }),
  
  register: (userData) =>
    client.post('/users/register/', userData),
  
  getCurrentUser: () =>
    client.get('/users/me/'),
};

