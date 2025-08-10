import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  IsInt,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/tasks.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: Date;

  @IsOptional()
  @IsDateString()
  dateFin?: Date;

  @IsOptional()
  @IsEnum(TaskStatus)
  statut?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priorite?: TaskPriority;

  @IsOptional()
  @IsString()
  specialite?: string;

  @IsOptional()
  @IsInt()
  projetId?: number;

  @IsOptional()
  @IsInt()
  membreId?: number;
}
