import api from './axios';

export const register = (userData) => {
  return api.post('/users', userData);
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data.access_token) {
    localStorage.setItem('token', res.data.access_token);

    // Stocker info user (email + rôle)
    const payload = JSON.parse(atob(res.data.access_token.split('.')[1]));
    localStorage.setItem('role', payload.role);
    localStorage.setItem('email', payload.username);
  }
  return res.data;
};

export const getToken = () => localStorage.getItem('token');

// ✅ AJOUTE cette fonction :
export const getCurrentUser = () => {
  return api.get('/auth/me');
};
