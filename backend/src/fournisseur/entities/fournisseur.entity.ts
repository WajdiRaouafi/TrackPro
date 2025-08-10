// src/fournisseurs/entities/fournisseur.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Materiau } from 'src/materiau/entities/materiau.entity';

@Entity()
export class Fournisseur {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  nom: string;

  @Index()
  @Column()
  email: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({ nullable: true })
  contact?: string; // personne de contact

  @OneToMany(() => Materiau, (m) => m.fournisseur)
  materiaux: Materiau[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
