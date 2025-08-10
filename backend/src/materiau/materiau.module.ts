// src/materiau/materiau.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materiau } from './entities/materiau.entity';
import { Project } from 'src/projects/entities/projects.entity';
import { MateriauService } from './materiau.service';
import { MateriauController } from './materiau.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Materiau,Project])],
  controllers: [MateriauController],
  providers: [MateriauService],
  exports: [TypeOrmModule],
})
export class MateriauModule {}
