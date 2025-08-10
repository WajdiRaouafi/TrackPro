// src/materiau/dto/update-materiau.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMateriauDto } from './create-materiau.dto';

export class UpdateMateriauDto extends PartialType(CreateMateriauDto) {}
