import { PartialType } from '@nestjs/mapped-types';
import { CreateAffectationMembreProjetDto } from './create-affectation-membre-projet.dto';

export class UpdateAffectationMembreProjetDto extends PartialType(CreateAffectationMembreProjetDto) {}
