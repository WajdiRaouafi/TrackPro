// src/api/equipements.ts
import api from "./axios";

export enum StatutEquipement {
  DISPONIBLE = "Disponible",
  EN_PANNE = "En panne",
  EN_UTILISATION = "En utilisation",
  MAINTENANCE = "Maintenance",
}

export const getEquipements = (params?: Record<string, any>) =>
  api.get("/equipements", { params });

export const getEquipementById = (id: number | string) =>
  api.get(`/equipements/${id}`);

export const getEquipement = getEquipementById;

export const createEquipement = (data: any) =>
  api.post("/equipements", data, {
    headers: { "Content-Type": "application/json" },
  });

export const updateEquipement = (id: number | string, data: any) =>
  api.patch(`/equipements/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteEquipement = (id: number | string) =>
  api.delete(`/equipements/${id}`);

export const getEquipementsAlertes = () =>
  api.get("/equipements/alertes/stock");

export const getEquipementsCouts = () =>
  api.get("/equipements/statistiques/couts");

/** 🔔 Notifications (stock & approvisionnement proche)
 *  → tu peux ajuster la fenêtre avec `days` (défaut 7)
 */
export const getEquipementsNotifications = (days = 7) =>
  api.get("/equipements/notifications", { params: { days } });
