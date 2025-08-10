import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { StatutEquipement } from '../entities/equipement.entity';

export class UpdateEquipementDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsEnum(StatutEquipement)
  statut?: StatutEquipement;

  @IsOptional()
  @IsNumber()
  coutParJour?: number;

  @IsOptional()
  @IsNumber()
  joursUtilisation?: number;

  @IsOptional()
  @IsBoolean()
  approvisionnementRequis?: boolean;

  @IsOptional()
  @IsDateString()
  dateDernierApprovisionnement?: Date;

  @IsOptional()
  @IsNumber()
  frequenceApprovisionnementJours?: number;

  @IsOptional()
  @IsNumber()
  projetId?: number;
}
