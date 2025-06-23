import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './projects.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  create(data: Partial<Project>) {
    const project = this.projectRepository.create(data);
    return this.projectRepository.save(project);
  }

  findAll() {
    return this.projectRepository.find();
  }

  findOne(id: number) {
    return this.projectRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<Project>) {
    await this.projectRepository.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.projectRepository.delete(id);
  }
}
