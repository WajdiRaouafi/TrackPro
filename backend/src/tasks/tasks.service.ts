import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/tasks.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Project } from 'src/projects/entities/projects.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateTaskDto): Promise<Task> {
    const project = await this.projectRepository.findOneBy({ id: data.projetId });
    if (!project) throw new NotFoundException('Projet non trouvé');

    const membre = await this.userRepository.findOneBy({ id: data.membreId });
    if (!membre) throw new NotFoundException('Membre non trouvé');

    const task = this.taskRepository.create({
      ...data,
      projet: project,
      membre: membre,
    });

    return this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['projet', 'membre'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['projet', 'membre'],
    });

    if (!task) throw new NotFoundException('Tâche introuvable');
    return task;
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (data.projetId) {
      const project = await this.projectRepository.findOneBy({ id: data.projetId });
      if (!project) throw new NotFoundException('Projet non trouvé');
      task.projet = project;
    }

    if (data.membreId) {
      const membre = await this.userRepository.findOneBy({ id: data.membreId });
      if (!membre) throw new NotFoundException('Membre non trouvé');
      task.membre = membre;
    }

    Object.assign(task, data);
    return this.taskRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    return this.taskRepository.remove(task);
  }
}
