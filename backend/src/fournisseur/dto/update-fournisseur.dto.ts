// src/fournisseurs/dto/update-fournisseur.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFournisseurDto } from './create-fournisseur.dto';

export class UpdateFournisseurDto extends PartialType(CreateFournisseurDto) {}
