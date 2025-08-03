import api from "./axios";

export const getUsers = () => api.get("/users");

export const getUserById = (id) => api.get(`/users/${id}`);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (userId) => api.delete(`/users/${userId}`);

export const toggleUserStatus = (id, isActive) =>
  api.patch(`/users/${id}`, { isActive });

export const updateOwnProfile = (data) => api.patch("/users/me", data);

export const createUser = (userData) => {
  return api.post("/users", userData);
};
