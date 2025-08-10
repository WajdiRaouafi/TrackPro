import { Expose, Type } from 'class-transformer';
import { ProjetEtat } from '../entities/projects.entity';

class ChefProjetDto {
  @Expose()
  id: number;

  @Expose()
  nom: string;

  @Expose()
  prenom: string;

  @Expose()
  email: string;
}

export class ProjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  nom: string;

  @Expose()
  description: string;

  @Expose()
  adresse: string;

  @Expose()
  dateDebut: Date;

  @Expose()
  dateFin: Date;

  @Expose()
  budget: number;

  @Expose()
  etat: ProjetEtat;

  @Expose()
  @Type(() => ChefProjetDto)
  chefProjet: ChefProjetDto;
}
