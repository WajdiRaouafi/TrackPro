import { IsEmail, IsOptional, IsString, IsEnum, IsBoolean, IsPhoneNumber, IsNumber } from 'class-validator';
import { UserRole } from '../entities/users.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide' })
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le salaire journalier doit être un nombre' })
  salaireJournalier?: number;
}
