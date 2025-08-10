import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Task } from 'src/tasks/entities/tasks.entity';
// import { Materiau } from 'src/resources/materiau.entity';
import { Equipement } from 'src/equipement/entities/equipement.entity';
import { Materiau } from 'src/materiau/entities/materiau.entity';

export enum ProjetEtat {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
}

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

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({
    type: 'enum',
    enum: ProjetEtat,
    default: ProjetEtat.EN_ATTENTE,
  })
  etat: ProjetEtat;

  @ManyToOne(() => User, (user) => user.projets, {
    eager: true,
    nullable: false,
    onDelete: 'SET NULL',
  })
  chefProjet: User;

  @OneToMany(() => Task, (task) => task.projet, { eager: true })
  tasks: Task[];

  @OneToMany(() => Equipement, (equipement) => equipement.projet)
  equipements: Equipement[];

  @OneToMany(() => Materiau, (materiau) => materiau.projet)
  materiaux: Materiau[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
