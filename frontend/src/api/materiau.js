import axios from './axios';

// ✅ Récupérer tous les matériaux
export const getAllMateriaux = () => {
  return axios.get('/materiaux');
};

// ✅ Récupérer un seul matériau
export const getMateriauById = (id) => {
  return axios.get(`/materiaux/${id}`);
};

// ✅ Créer un matériau
export const createMateriau = (data) => {
  return axios.post('/materiaux', data);
};

// ✅ Mettre à jour un matériau
export const updateMateriau = (id, data) => {
  return axios.patch(`/materiaux/${id}`, data);
};

// ✅ Supprimer un matériau
export const deleteMateriau = (id) => {
  return axios.delete(`/materiaux/${id}`);
};
