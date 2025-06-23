import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() data: Partial<Project>) {
    return this.projectsService.create(data);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: Partial<Project>) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.projectsService.remove(id);
  }
}