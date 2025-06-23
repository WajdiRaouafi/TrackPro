import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  statut: string;  // en cours, terminée, en retard

  @Column()
  priorite: string;

  @Column()
  specialite: string;
}
