import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AffectationMembreProjetService } from './affectation-membre-projet.service';
import { CreateAffectationMembreProjetDto } from './dto/create-affectation-membre-projet.dto';
import { UpdateAffectationMembreProjetDto } from './dto/update-affectation-membre-projet.dto';

@Controller('affectation-membre-projet')
export class AffectationMembreProjetController {
  constructor(private readonly affectationMembreProjetService: AffectationMembreProjetService) {}

  @Post()
  create(@Body() createAffectationMembreProjetDto: CreateAffectationMembreProjetDto) {
    return this.affectationMembreProjetService.create(createAffectationMembreProjetDto);
  }

  @Get()
  findAll() {
    return this.affectationMembreProjetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affectationMembreProjetService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAffectationMembreProjetDto: UpdateAffectationMembreProjetDto) {
    return this.affectationMembreProjetService.update(+id, updateAffectationMembreProjetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.affectationMembreProjetService.remove(+id);
  }
}
