// src/api/materiaux.js
import api from "./axios";

export const getAllMateriaux = () => api.get("/materiaux");
export const getMateriauById = (id) => api.get(`/materiaux/${id}`);
export const createMateriau = (data) => api.post("/materiaux", data);
export const updateMateriau = (id, data) => api.put(`/materiaux/${id}`, data);
export const deleteMateriau = (id) => api.delete(`/materiaux/${id}`);

export const getMateriauStats = () => api.get("/materiaux/statistiques/globales");
export const triggerCommandeAuto = () => api.post("/materiaux/commande-auto");
