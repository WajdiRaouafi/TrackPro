import api from './axios';

export const getUsers = () => api.get('/users');
export const toggleUserStatus = (id, isActive) =>
  api.patch(`/users/${id}`, { isActive });

export const updateOwnProfile = (data) => api.patch('/users/me', data);
