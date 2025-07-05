import { Expose, Transform, Type } from 'class-transformer';

export class MemberDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}

export class TaskDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Type(() => MemberDto)
  @Expose()
  membre: MemberDto;
}

export class ChefDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}

export class ProjectWithTeamDto {
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

  @Type(() => ChefDto)
  @Expose()
  chefProjet: ChefDto;

  @Type(() => TaskDto)
  @Expose()
  tasks: TaskDto[];
}
