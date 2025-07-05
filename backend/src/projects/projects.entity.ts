import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Task } from 'src/tasks/tasks.entity';
import { Materiau } from 'src/resources/materiau.entity';
import { Equipement } from 'src/resources/equipement.entity';

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

  @ManyToOne(() => User, (user) => user.projets, { eager: true })
  chefProjet: User;

  @OneToMany(() => Task, (task) => task.projet, { eager: true })
  tasks: Task[];

  @OneToMany(() => Equipement, (equipement) => equipement.projet)
  equipements: Equipement[];

  @OneToMany(() => Materiau, (materiau) => materiau.projet)
  materiaux: Materiau[];

}
