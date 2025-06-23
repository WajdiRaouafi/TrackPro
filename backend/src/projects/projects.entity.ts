import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  description: string;

  @Column()
  adresse: string;

  @Column()
  dateDebut: Date;

  @Column()
  dateFin: Date;

  @Column()
  budget: number;
}
