import axios from './axios';

// ✅ Récupérer tous les équipements
export const getAllEquipements = () => {
  return axios.get('/equipements');
};

// ✅ Récupérer un équipement par ID
export const getEquipementById = (id) => {
  return axios.get(`/equipements/${id}`);
};

// ✅ Créer un équipement
export const createEquipement = (data) => {
  return axios.post('/equipements', data);
};

// ✅ Mettre à jour un équipement
export const updateEquipement = (id, data) => {
  return axios.patch(`/equipements/${id}`, data);
};

// ✅ Supprimer un équipement
export const deleteEquipement = (id) => {
  return axios.delete(`/equipements/${id}`);
};

