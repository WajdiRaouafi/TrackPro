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
  Query,
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

  // ✅ Notifications (stock bas + approvisionnement bientôt)
  // GET /equipements/notifications?days=7
  @Get('notifications')
  getNotifications(@Query('days') days?: string) {
    const n = days ? parseInt(days, 10) : 7;
    return this.equipementService.getNotifications(Number.isFinite(n) ? n : 7);
  }

  // ✅ Équipements en alerte de stock
  @Get('alertes/stock')
  findEquipementsEnAlerte(): Promise<Equipement[]> {
    return this.equipementService.findEquipementsEnAlerte();
  }

  // ✅ Approvisionnement bientôt (optionnel)
  // GET /equipements/alertes/approvisionnement?days=7
  @Get('alertes/approvisionnement')
  findEquipementsApprovisionnementProche(@Query('days') days?: string) {
    const n = days ? parseInt(days, 10) : 7;
    return this.equipementService.findEquipementsApprovisionnementProche(
      Number.isFinite(n) ? n : 7,
    );
  }

  // ✅ Statistique : coût total d’utilisation
  @Get('statistiques/couts')
  calculerCoutTotal(): Promise<{ total: number }> {
    return this.equipementService.calculerCoutTotal();
  }

  // ✅ Récupérer un équipement par ID (laisser APRÈS les routes statiques)
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
}
