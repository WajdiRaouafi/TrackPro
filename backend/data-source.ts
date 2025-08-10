// backend/data-source.ts
import { DataSource } from 'typeorm';
import { Project } from './src/projects/entities/projects.entity';
import { User } from './src/users/entities/users.entity';
import { Task } from './src/tasks/entities/tasks.entity';
import { Materiau } from 'src/materiau/entities/materiau.entity';
import { Equipement } from 'src/equipement/entities/equipement.entity';
import { Equipe } from './src/equipe/entities/equipe.entity';
import { AffectationMembreProjet } from './src/affectation-membre-projet/entities/affectation-membre-projet.entity';

// ajoute les entités nécessaires

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost', // ou 'db' si tu es dans docker-compose
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'trackpro',
  entities: [Project, User, Task, Materiau, Equipement,Equipe, AffectationMembreProjet],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
