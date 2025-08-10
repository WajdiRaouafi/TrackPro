import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMateriauDto {
  @IsString()
  nom: string;

  @IsString()
  type: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  seuil?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  coutUnitaire?: number;

  @IsOptional()
  @IsDateString()
  dateProchainApprovisionnement?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  commandeEnvoyee?: boolean;

  // IDs optionnels (null ou undefined acceptés)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projetId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fournisseurId?: number | null;
}

