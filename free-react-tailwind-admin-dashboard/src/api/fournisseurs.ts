// src/api/fournisseurs.ts
import api from "./axios";

export type FournisseurPayload = {
  nom: string;
  contact?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siteWeb?: string;
};

export const getFournisseurs = (q?: string) =>
  api.get("/fournisseurs", { params: q ? { q } : undefined });

export const getFournisseurById = (id: number | string) =>
  api.get(`/fournisseurs/${id}`);

export const createFournisseur = (data: FournisseurPayload) =>
  api.post("/fournisseurs", data, {
    headers: { "Content-Type": "application/json" },
  });

export const updateFournisseur = (id: number | string, data: Partial<FournisseurPayload>) =>
  api.put(`/fournisseurs/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteFournisseur = (id: number | string) =>
  api.delete(`/fournisseurs/${id}`);
