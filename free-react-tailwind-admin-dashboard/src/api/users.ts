import api from "./axios";

export const getUsers = () => api.get("/users");
export const getUserById = (id: number | string) => api.get(`/users/${id}`);

export const updateUser = (id: number | string, data: FormData) =>
  api.patch(`/users/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteUser = (userId: number | string) => api.delete(`/users/${userId}`);

export const toggleUserStatus = (id: number | string, isActive: boolean) =>
  api.patch(`/users/${id}`, { isActive });

export const updateOwnProfile = (data: FormData) =>
  api.patch("/users/me", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Inscription (avec photo) en multipart/form-data
export const registerUser = (formData: FormData) =>
  api.post("/users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// (optionnel) alias si tu utilises encore 'createUser' ailleurs
export const createUser = registerUser;

export const uploadUserPhoto = (file: File) => {
  const fd = new FormData();
  fd.append("photo", file);
  return api.post("/users/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

