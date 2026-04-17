import client from './client';

export const authAPI = {
  login: (email, password) =>
    client.post('/auth/login/', { email, password }),
  
  register: (userData) =>
    client.post('/auth/register/', userData),
  
  logout: () =>
    client.post('/auth/logout/'),
  
  getCurrentUser: () =>
    client.get('/auth/user/'),
  
  refreshToken: () =>
    client.post('/auth/token/refresh/'),
};
