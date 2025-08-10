import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/projects.entity';
import { User, UserRole } from 'src/users/entities/users.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ Créer un projet
  async create(data: CreateProjectDto): Promise<Project> {
    const user = await this.userRepository.findOneBy({ id: data.chefProjetId });

    if (!user || user.role !== UserRole.CHEF_PROJET) {
      throw new BadRequestException(
        'Seuls les chefs de projet peuvent être assignés.',
      );
    }

    const project = this.projectRepository.create({
      ...data,
      chefProjet: user,
    });

    const savedProject = await this.projectRepository.save(project);

    // 🛠️ Associer les équipements s'ils sont fournis
    if (data.equipementIds?.length) {
      await this.projectRepository.manager
        .createQueryBuilder()
        .update('equipement')
        .set({ projet: savedProject })
        .whereInIds(data.equipementIds)
        .execute();
    }

    // 🛠️ Associer les matériaux s'ils sont fournis
    if (data.materiauIds?.length) {
      await this.projectRepository.manager
        .createQueryBuilder()
        .update('materiau')
        .set({ projet: savedProject })
        .whereInIds(data.materiauIds)
        .execute();
    }

    return savedProject;
  }

  // ✅ Trouver tous les projets
 async findAll(): Promise<Project[]> {
  return this.projectRepository.find({
    relations: ['chefProjet', 'tasks', 'tasks.membre', 'equipements'],
  });
}


  // ✅ Trouver tous les projets (version utilisée avec DTOs)
  async findAllWithTeam(): Promise<Project[]> {
    return this.findAll();
  }

  // ✅ Trouver un projet par ID
  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['chefProjet', 'tasks', 'tasks.membre', 'equipements'],
    });

    if (!project) throw new NotFoundException('Projet introuvable');
    return project;
  }

  // ✅ Mise à jour
  async update(id: number, data: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    if (!project) throw new NotFoundException('Projet introuvable');

    // Si un nouveau chef de projet est défini
    if (data.chefProjetId) {
      const user = await this.userRepository.findOneBy({
        id: data.chefProjetId,
      });

      if (!user || user.role !== UserRole.CHEF_PROJET) {
        throw new BadRequestException(
          'Le nouveau chef de projet doit avoir le rôle CHEF_PROJET.',
        );
      }

      project.chefProjet = user;
    }

    Object.assign(project, data);
    return this.projectRepository.save(project);
  }

  // ✅ Supprimer un projet
  async remove(id: number) {
    const project = await this.findOne(id);
    if (!project) throw new NotFoundException('Projet introuvable');
    return this.projectRepository.delete(id);
  }

  // ✅ Nombre total de projets
  async countProjects(): Promise<number> {
    return this.projectRepository.count();
  }
}
