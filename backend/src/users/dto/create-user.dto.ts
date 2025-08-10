import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsPhoneNumber, IsNumber } from 'class-validator';
import { UserRole } from '../entities/users.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide' })
  telephone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role: UserRole;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le salaire journalier doit être un nombre' })
  salaireJournalier?: number;
}
