// src/api/materiaux.ts
import api from "./axios";

/** Charge utile pour créer/mettre à jour un matériau */
export interface MateriauPayload {
  nom: string;
  type: string;
  stock?: number;
  seuil?: number;
  coutUnitaire?: number;
  /** ISO date "YYYY-MM-DD" ou null pour effacer */
  dateProchainApprovisionnement?: string | null;
  commandeEnvoyee?: boolean;
  /** Relations optionnelles */
  projetId?: number | null;
  fournisseurId?: number | null;
}

/** LISTE */
export const getMateriaux = (params?: Record<string, any>) =>
  api.get("/materiau", { params });

/** DÉTAIL */
export const getMateriauById = (id: number | string) =>
  api.get(`/materiau/${id}`);

// alias (compat)
export const getMateriau = getMateriauById;

/** CRÉER */
export const createMateriau = (data: MateriauPayload) =>
  api.post("/materiau", data, {
    headers: { "Content-Type": "application/json" },
  });

/** METTRE À JOUR
 *  (côté backend c’est un PUT)
 */
export const updateMateriau = (
  id: number | string,
  data: Partial<MateriauPayload>
) =>
  api.put(`/materiau/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

/** SUPPRIMER */
export const deleteMateriau = (id: number | string) =>
  api.delete(`/materiau/${id}`);

/** STATS GLOBALES (total, sousSeuil, rupture, commandesEnvoyees, valeurTotaleStock) */
export const getMateriauxStatsGlobales = () =>
  api.get("/materiau/statistiques/globales");

/** Déclencher la commande auto si stock < seuil (DRY-RUN côté backend) */
export const triggerCommandeAuto = () =>
  api.post("/materiau/commande-auto");
