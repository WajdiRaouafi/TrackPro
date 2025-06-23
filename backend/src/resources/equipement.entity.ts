import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  statut: string;  // disponible, panne, maintenance
}
