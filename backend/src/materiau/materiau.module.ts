import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Materiau } from './entities/materiau.entity';
import { MateriauService } from './materiau.service';
import { MateriauController } from './materiau.controller';
import { Project } from 'src/projects/entities/projects.entity';
import { Fournisseur } from 'src/fournisseur/entities/fournisseur.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Materiau, Project, Fournisseur]), // ✅ Fournisseur ici
  ],
  controllers: [MateriauController],
  providers: [MateriauService],
  exports: [MateriauService],
})
export class MateriauModule {}
