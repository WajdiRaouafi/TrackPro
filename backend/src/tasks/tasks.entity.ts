import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from 'src/projects/projects.entity';
import { User } from 'src/users/users.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  dateDebut: Date;

  @Column()
  dateFin: Date;

  @Column()
  statut: string;

  @Column()
  priorite: string;

  @Column()
  specialite: string;

  @ManyToOne(() => Project, (project) => project.tasks)
  projet: Project;

  
  @ManyToOne(() => User, (user) => user.tachesAssignees, { eager: true })
  membre: User;

}
