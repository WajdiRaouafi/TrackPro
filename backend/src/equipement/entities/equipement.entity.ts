// src/equipements/entities/equipement.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from 'src/projects/entities/projects.entity';

export enum StatutEquipement {
  DISPONIBLE = 'Disponible',
  EN_PANNE = 'En panne',
  EN_UTILISATION = 'En utilisation',
  MAINTENANCE = 'Maintenance',
}

@Entity()
export class Equipement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column({ unique: true })
  numeroSerie: string;

  @Column({
    type: 'enum',
    enum: StatutEquipement,
    default: StatutEquipement.DISPONIBLE,
  })
  statut: StatutEquipement;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  seuil: number;

  @Column({ type: 'date', nullable: true })
  dateProchainApprovisionnement: Date;

  @Column({ type: 'float', default: 0 })
  coutParJour: number;

  @Column({ type: 'int', default: 0 })
  joursUtilisation: number;

  @ManyToOne(() => Project, (project) => project.equipements, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  projet: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
