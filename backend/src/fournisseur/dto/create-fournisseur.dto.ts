// src/fournisseurs/dto/create-fournisseur.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFournisseurDto {
  @IsNotEmpty() @IsString()
  nom: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsString()
  telephone?: string;

  @IsOptional() @IsString()
  adresse?: string;

  @IsOptional() @IsString()
  contact?: string;
}

