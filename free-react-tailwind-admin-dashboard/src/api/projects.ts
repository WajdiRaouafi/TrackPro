// src/api/projects.ts
import api from "./axios";

/** LISTE */
export const getProjects = (params?: Record<string, any>) =>
  api.get("/projects", { params });

/** DETAIL */
export const getProjectById = (id: number | string) =>
  api.get(`/projects/${id}`);

// alias pour compatibilité avec l'ancien code
export const getProject = getProjectById;

/** CREATE */
export const createProject = (data: any) =>
  api.post("/projects", data, {
    headers: { "Content-Type": "application/json" },
  });

/** UPDATE (partiel) */
export const updateProject = (id: number | string, data: any) =>
  api.patch(`/projects/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

/** DELETE */
export const deleteProject = (id: number | string) =>
  api.delete(`/projects/${id}`);


// Crée un FormData et utilise ces fonctions :

export const createProjectMultipart = (formData: FormData) =>
  api.post("/projects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProjectMultipart = (id: number | string, formData: FormData) =>
  api.patch(`/projects/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
