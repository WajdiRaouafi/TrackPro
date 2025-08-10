import { Injectable } from '@nestjs/common';
import { CreateAffectationMembreProjetDto } from './dto/create-affectation-membre-projet.dto';
import { UpdateAffectationMembreProjetDto } from './dto/update-affectation-membre-projet.dto';

@Injectable()
export class AffectationMembreProjetService {
  create(createAffectationMembreProjetDto: CreateAffectationMembreProjetDto) {
    return 'This action adds a new affectationMembreProjet';
  }

  findAll() {
    return `This action returns all affectationMembreProjet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} affectationMembreProjet`;
  }

  update(id: number, updateAffectationMembreProjetDto: UpdateAffectationMembreProjetDto) {
    return `This action updates a #${id} affectationMembreProjet`;
  }

  remove(id: number) {
    return `This action removes a #${id} affectationMembreProjet`;
  }
}
