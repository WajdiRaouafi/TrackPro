export type UserRole =
  | "ADMIN"
  | "CHEF_PROJET"
  | "MEMBRE_EQUIPE"
  | "GESTIONNAIRE_RESSOURCES";

export interface User {
  id: number;
  nom?: string;
  prenom?: string;
  telephone?: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  photoUrl?: string;
  salaireJournalier?: number;
  projetActuelId?: number | null;
}
