import api from './axios';

// 🔁 Liste tous les utilisateurs
export const getUsers = () => api.get('/users');

// ✅ Obtenir un utilisateur par ID
export const getUserById = (id) => api.get(`/users/${id}`);

// ✅ Mettre à jour un utilisateur (depuis l’admin)
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

// ✅ Supprimer un utilisateur
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// ✅ Activer/Désactiver un utilisateur
export const toggleUserStatus = (id, isActive) =>
  api.patch(`/users/${id}`, { isActive });

// ✅ Mise à jour de son propre profil
export const updateOwnProfile = (data) => api.patch('/users/me', data);
