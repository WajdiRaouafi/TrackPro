import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { StatutEquipement } from '../entities/equipement.entity';
import { Type } from 'class-transformer';

export class CreateEquipementDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  numeroSerie: string;

  @IsEnum(StatutEquipement)
  statut: StatutEquipement;

  @IsNumber()
  coutParJour: number;

  @IsOptional()
  @IsNumber()
  joursUtilisation?: number;

  @IsBoolean()
  approvisionnementRequis: boolean;

  @IsOptional()
  @IsDateString()
  dateDernierApprovisionnement?: Date;

  @IsOptional()
  @IsNumber()
  frequenceApprovisionnementJours?: number;

  @IsNotEmpty()
  @IsNumber()
  projetId: number;
}
