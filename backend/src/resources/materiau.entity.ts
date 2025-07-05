import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from 'src/projects/projects.entity';

@Entity()
export class Materiau {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column()
  quantiteDisponible: number;

  @Column()
  stockMinimum: number;

  @ManyToOne(() => Project, (project) => project.materiaux)
  projet: Project;
}
