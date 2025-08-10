import { Module } from '@nestjs/common';
import { AffectationMembreProjetService } from './affectation-membre-projet.service';
import { AffectationMembreProjetController } from './affectation-membre-projet.controller';

@Module({
  controllers: [AffectationMembreProjetController],
  providers: [AffectationMembreProjetService],
})
export class AffectationMembreProjetModule {}
