import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  create(data: Partial<Task>) {
    const task = this.taskRepository.create(data);
    return this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find();
  }

  findOne(id: number) {
    return this.taskRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<Task>) {
    await this.taskRepository.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.taskRepository.delete(id);
  }
}
