import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ProjetEtat } from '../entities/projects.entity';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  adresse: string;

  @IsNotEmpty()
  @IsDateString()
  dateDebut: Date;

  @IsNotEmpty()
  @IsDateString()
  dateFin: Date;

  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @IsEnum(ProjetEtat)
  etat: ProjetEtat;

  @IsNotEmpty()
  @IsNumber()
  chefProjetId: number; // 🔁 Utilisé dans le controller pour lier au User

  @IsOptional()
  @IsArray()
  equipementIds?: number[];

  @IsOptional()
  @IsArray()
  materiauIds?: number[];
}
