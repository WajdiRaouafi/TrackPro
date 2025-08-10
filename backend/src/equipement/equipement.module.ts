import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipementController } from './equipement.controller';
import { EquipementService } from './equipement.service';
import { Equipement } from './entities/equipement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipement])],
  controllers: [EquipementController],
  providers: [EquipementService],
  exports: [EquipementService], // <-- utile si un autre module doit l’utiliser
})
export class EquipementModule {}
