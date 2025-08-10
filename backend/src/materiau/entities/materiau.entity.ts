// src/materiaux/entities/materiau.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from 'src/projects/entities/projects.entity';
// ⚠️ adapte le chemin selon ton module: 'fournisseur' ou 'fournisseurs'
import { Fournisseur } from 'src/fournisseur/entities/fournisseur.entity';

@Entity()
export class Materiau {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  seuil: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  coutUnitaire: number;

  @Column({ type: 'date', nullable: true })
  dateProchainApprovisionnement: Date | null;

  // ❌ SUPPRIMER l’ancienne colonne texte :
  // @Column({ nullable: true })
  // fournisseur: string;

  @Column({ default: false })
  commandeEnvoyee: boolean;

  @ManyToOne(() => Project, (project) => project.equipements, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  projet?: Project | null;

  @ManyToOne(() => Fournisseur, (f) => f.materiaux, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  fournisseur?: Fournisseur | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
