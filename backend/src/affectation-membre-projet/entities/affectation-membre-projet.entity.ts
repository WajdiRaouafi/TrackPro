import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,    
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Project } from 'src/projects/entities/projects.entity'; 

@Entity()
export class AffectationMembreProjet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  membre: User;

  @ManyToOne(() => Project)
  projet: Project;

  @Column()
  dateDebut: Date;

  @Column({ nullable: true })
  dateFin: Date;

  @Column({ default: true })
  actif: boolean;
}

