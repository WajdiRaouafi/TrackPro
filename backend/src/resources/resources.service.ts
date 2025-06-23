import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipement } from './equipement.entity';
import { Materiau } from './materiau.entity';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Equipement)
    private readonly equipementRepo: Repository<Equipement>,
    @InjectRepository(Materiau)
    private readonly materiauRepo: Repository<Materiau>,
  ) {}

  createEquipement(data: Partial<Equipement>) {
    const e = this.equipementRepo.create(data);
    return this.equipementRepo.save(e);
  }

  findAllEquipements() {
    return this.equipementRepo.find();
  }

  createMateriau(data: Partial<Materiau>) {
    const m = this.materiauRepo.create(data);
    return this.materiauRepo.save(m);
  }

  findAllMateriaux() {
    return this.materiauRepo.find();
  }
}
