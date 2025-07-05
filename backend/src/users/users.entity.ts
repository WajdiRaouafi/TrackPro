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


  @OneToMany(() => Project, (project) => project.chefProjet)
  projets: Project[];

  @OneToMany(() => Task, (task) => task.membre)
  tachesAssignees: Task[];

}



