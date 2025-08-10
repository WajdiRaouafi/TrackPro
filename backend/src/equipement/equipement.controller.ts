import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { EquipementService } from './equipement.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';
import { Equipement } from './entities/equipement.entity';

@Controller('equipements')
export class EquipementController {
  constructor(private readonly equipementService: EquipementService) {}

  // ✅ Créer un nouvel équipement
  @Post()
  create(@Body() createDto: CreateEquipementDto): Promise<Equipement> {
    return this.equipementService.create(createDto);
  }

  // ✅ Récupérer tous les équipements
  @Get()
  findAll(): Promise<Equipement[]> {
    return this.equipementService.findAll();
  }

  // ✅ Récupérer un équipement par ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Equipement> {
    const equipement = await this.equipementService.findOne(id);
    if (!equipement) {
      throw new NotFoundException('Équipement introuvable');
    }
    return equipement;
  }

  // ✅ Mettre à jour un équipement
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEquipementDto,
  ): Promise<Equipement> {
    return this.equipementService.update(id, updateDto);
  }

  // ✅ Supprimer un équipement
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.equipementService.remove(id);
  }

  // ✅ Équipements nécessitant réapprovisionnement
  @Get('alertes/stock')
  findEquipementsEnAlerte(): Promise<Equipement[]> {
    return this.equipementService.findEquipementsEnAlerte();
  }

  // ✅ Statistique : Coût d’utilisation total de tous les équipements
  @Get('statistiques/couts')
  calculerCoutTotal(): Promise<{ total: number }> {
    return this.equipementService.calculerCoutTotal();
  }
  @Get('notifications')
  getNotifications() {
    return this.equipementService.getNotifications();
  }
}
