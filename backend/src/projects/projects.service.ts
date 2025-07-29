import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './projects.entity';
import { BadRequestException } from '@nestjs/common/exceptions';  
import { User } from 'src/users/users.entity';


 
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // create(data: Partial<Project>) {
  //   const project = this.projectRepository.create(data);
  //   return this.projectRepository.save(project);
  // }
  async create(data: Partial<Project>): Promise<Project> {
  const userId = typeof data.chefProjet === 'object' ? data.chefProjet.id : data.chefProjet;

  const user = await this.userRepository.findOneBy({ id: userId });

  if (!user || user.role !== 'CHEF_PROJET') {
    throw new BadRequestException('Seuls les utilisateurs ayant le rôle CHEF_PROJET peuvent être chef de projet');
  }

  const project = this.projectRepository.create({ ...data, chefProjet: user });
  return this.projectRepository.save(project);
}



  // findAll() {
  //   return this.projectRepository.find();
  // }

  findAll() {
  return this.projectRepository.find({
    relations: ['chefProjet', 'tasks', 'tasks.membre'],
  });
}


  findOne(id: number) {
    return this.projectRepository.findOneBy({ id });
  }

  // async update(id: number, data: Partial<Project>) {
  //   await this.projectRepository.update(id, data);
  //   return this.findOne(id);
  // }
  async update(id: number, data: Partial<Project>) {
  // Exclure les relations OneToMany
  const { tasks, equipements, materiaux, ...projectData } = data;

  await this.projectRepository.update(id, projectData);
  return this.findOne(id);
}


  findAllWithTeam() {
  return this.projectRepository.find({
    relations: ['chefProjet', 'tasks', 'tasks.membre'],
  });
  }


  remove(id: number) {
    return this.projectRepository.delete(id);
  }
}
