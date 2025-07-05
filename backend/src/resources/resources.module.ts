import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Equipement } from './equipement.entity';
import { Materiau } from './materiau.entity';
import { Project } from 'src/projects/projects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipement, Materiau, Project])],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService], // optionnel : si un autre module utilise le service
})
export class ResourcesModule {}
