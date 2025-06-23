import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  CHEF_PROJET = 'CHEF_PROJET',
  MEMBRE_EQUIPE = 'MEMBRE_EQUIPE',
  GESTIONNAIRE_RESSOURCES = 'GESTIONNAIRE_RESSOURCES',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBRE_EQUIPE,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;
}



