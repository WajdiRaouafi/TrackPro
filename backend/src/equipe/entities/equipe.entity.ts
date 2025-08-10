import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';



@Entity()
export class Equipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string; // ex: "Équipe Électricité"

  @Column()
  specialite: string;

  @OneToMany(() => User, (user) => user.equipe)
  membres: User[];
}
