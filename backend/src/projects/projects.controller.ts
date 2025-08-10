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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { plainToInstance } from 'class-transformer';
import { Project } from './entities/projects.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ✅ Création d'un projet
  @Post()
  async create(@Body() data: CreateProjectDto): Promise<Project> {
    return await this.projectsService.create(data);
  }

  // ✅ Récupérer tous les projets avec leurs équipes

  @Get()
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.findAllWithTeam();
    return plainToInstance(ProjectResponseDto, projects, {
      excludeExtraneousValues: true,
    });
  }

  // ✅ Récupérer un projet par ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findOne(id);
    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }

  // ✅ Mettre à jour un projet
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const updated = await this.projectsService.update(id, data);
    return plainToInstance(ProjectResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  // ✅ Supprimer un projet
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
