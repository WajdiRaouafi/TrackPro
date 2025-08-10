import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { plainToInstance } from 'class-transformer';
import { Task } from './entities/tasks.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.tasksService.create(createTaskDto);
    return plainToInstance(Task, task, { excludeExtraneousValues: true });
  }

  @Get()
  async findAll() {
    const tasks = await this.tasksService.findAll();
    return tasks.map((t) =>
      plainToInstance(Task, t, { excludeExtraneousValues: true }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.findOne(id);
    return plainToInstance(Task, task, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(id, updateTaskDto);
    return plainToInstance(Task, task, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
