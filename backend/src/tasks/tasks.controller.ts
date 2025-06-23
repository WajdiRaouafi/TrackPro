import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() data: Partial<Task>) {
    return this.tasksService.create(data);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: Partial<Task>) {
    return this.tasksService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tasksService.remove(id);
  }
}