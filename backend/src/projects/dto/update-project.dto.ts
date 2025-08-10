import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ProjetEtat } from '../entities/projects.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: Date;

  @IsOptional()
  @IsDateString()
  dateFin?: Date;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(ProjetEtat)
  etat?: ProjetEtat;

  @IsOptional()
  @IsNumber()
  chefProjetId?: number;
}
