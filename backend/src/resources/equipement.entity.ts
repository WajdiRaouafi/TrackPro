import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from 'src/projects/projects.entity';

@Entity()
export class Equipement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column()
  numeroSerie: string;

  @Column()
  statut: string;

  @ManyToOne(() => Project, (project) => project.equipements)
  projet: Project;
}
