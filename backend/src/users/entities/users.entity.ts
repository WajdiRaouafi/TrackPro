// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Project } from 'src/projects/projects.entity';
// import { Task } from 'src/tasks/tasks.entity';

// export enum UserRole {
//   ADMIN = 'ADMIN',
//   CHEF_PROJET = 'CHEF_PROJET',
//   MEMBRE_EQUIPE = 'MEMBRE_EQUIPE',
//   GESTIONNAIRE_RESSOURCES = 'GESTIONNAIRE_RESSOURCES',
// }


// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

// @Column({ nullable: true })
// nom: string;

// @Column({ nullable: true })
// prenom: string;

// @Column({ nullable: true })
// telephone: string;


//   @Column()
//   email: string;

//   @Column()
//   password: string;

//   @Column({
//     type: 'enum',
//     enum: UserRole,
//     default: UserRole.MEMBRE_EQUIPE,
//   })
//   role: UserRole;

//   @Column({ default: false })
//   isActive: boolean;
  
//   @Column({ nullable: true })
//   photoUrl: string;
  
//   @OneToMany(() => Project, (project) => project.chefProjet)
//   projets: Project[];

//   @OneToMany(() => Task, (task) => task.membre)
//   tachesAssignees: Task[];
// }
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   OneToMany,
//   ManyToOne,
// } from 'typeorm';
// import { Project } from 'src/projects/projects.entity';
// import { Task } from 'src/tasks/tasks.entity';
// import { Equipe } from 'src/equipe/entities/equipe.entity';

// export enum UserRole {
//   ADMIN = 'ADMIN',
//   CHEF_PROJET = 'CHEF_PROJET',
//   MEMBRE_EQUIPE = 'MEMBRE_EQUIPE',
//   GESTIONNAIRE_RESSOURCES = 'GESTIONNAIRE_RESSOURCES',
// }

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: true })
//   nom: string;

//   @Column({ nullable: true })
//   prenom: string;

//   @Column({ nullable: true })
//   telephone: string;

//   @Column()
//   email: string;

//   @Column()
//   password: string;

//   @Column({
//     type: 'enum',
//     enum: UserRole,
//     default: UserRole.MEMBRE_EQUIPE,
//   })
//   role: UserRole;

//   @Column({ default: false })
//   isActive: boolean;

//   @Column({ nullable: true })
//   photoUrl: string;

//   // ✅ Ajouté pour les membres d’équipe
//   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
//   salaireJournalier: number;

//   // ✅ Pour savoir s’il est affecté à un projet ou non
//   @Column({ nullable: true })
//   projetActuelId: number; // null = disponible

//   // ✅ Lien vers l’équipe
//   @ManyToOne(() => Equipe, (equipe) => equipe.membres, { nullable: true })
//   equipe: Equipe;

//   // ✅ Un chef de projet peut gérer plusieurs projets
//   @OneToMany(() => Project, (project) => project.chefProjet)
//   projets: Project[];

//   // ✅ Un membre d’équipe peut avoir plusieurs tâches
//   @OneToMany(() => Task, (task) => task.membre)
//   tachesAssignees: Task[];
// }

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Project } from 'src/projects/entities/projects.entity';
import { Task } from 'src/tasks/entities/tasks.entity';
import { Equipe } from 'src/equipe/entities/equipe.entity';
import { Exclude } from 'class-transformer';

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

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBRE_EQUIPE,
  })
  role: UserRole;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaireJournalier: number;

  @Column({ nullable: true })
  projetActuelId: number; // null = disponible

  @ManyToOne(() => Equipe, (equipe) => equipe.membres, { nullable: true })
  equipe: Equipe;

  @OneToMany(() => Project, (project) => project.chefProjet)
  projets: Project[];

  @OneToMany(() => Task, (task) => task.membre)
  tachesAssignees: Task[];
}
