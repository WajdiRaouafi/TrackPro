import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
