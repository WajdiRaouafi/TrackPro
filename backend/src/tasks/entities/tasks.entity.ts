import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from 'src/projects/entities/projects.entity';
import { User } from 'src/users/entities/users.entity';

// Enum pour le statut de la tâche
export enum TaskStatus {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
}

// Enum pour la priorité de la tâche
export enum TaskPriority {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  ELEVEE = 'ELEVEE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.A_FAIRE,
  })
  statut: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MOYENNE,
  })
  priorite: TaskPriority;

  @Column()
  specialite: string;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  projet: Project;

  @ManyToOne(() => User, (user) => user.tachesAssignees, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  membre: User;
}
