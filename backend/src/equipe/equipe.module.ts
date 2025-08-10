import { Module } from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { EquipeController } from './equipe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipe } from './entities/equipe.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Equipe])],
  controllers: [EquipeController],
  providers: [EquipeService],
  exports: [EquipeService],
})
export class EquipeModule {}
