import {
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsString,
  IsInt,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/tasks.entity';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  dateDebut: Date;

  @IsNotEmpty()
  @IsDateString()
  dateFin: Date;

  @IsEnum(TaskStatus)
  statut: TaskStatus;

  @IsEnum(TaskPriority)
  priorite: TaskPriority;

  @IsNotEmpty()
  @IsString()
  specialite: string;

  @IsNotEmpty()
  @IsInt()
  projetId: number;

  @IsNotEmpty()
  @IsInt()
  membreId: number;
}
