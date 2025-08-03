import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from 'src/projects/projects.entity';
import { Task } from 'src/tasks/tasks.entity';

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
  
  @OneToMany(() => Project, (project) => project.chefProjet)
  projets: Project[];

  @OneToMany(() => Task, (task) => task.membre)
  tachesAssignees: Task[];
}

