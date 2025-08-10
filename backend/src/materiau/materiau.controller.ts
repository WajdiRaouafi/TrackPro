import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { MateriauService } from './materiau.service';
import { CreateMateriauDto } from './dto/create-materiau.dto';
import { UpdateMateriauDto } from './dto/update-materiau.dto';
import { Materiau } from './entities/materiau.entity';

@Controller('materiaux')
export class MateriauController {
  constructor(private readonly materiauService: MateriauService) {}

  // ✅ Créer un matériau
  @Post()
  create(@Body() dto: CreateMateriauDto): Promise<Materiau> {
    return this.materiauService.create(dto);
  }

  // ✅ Récupérer tous les matériaux
  @Get()
  findAll(): Promise<Materiau[]> {
    return this.materiauService.findAll();
  }

  // ✅ Récupérer un matériau par ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Materiau> {
    return this.materiauService.findOne(id);
  }

  // ✅ Mettre à jour un matériau
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMateriauDto,
  ): Promise<Materiau> {
    return this.materiauService.update(id, dto);
  }

  // ✅ Supprimer un matériau
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.materiauService.remove(id);
  }

  // ✅ Statistiques globales des matériaux
  @Get('statistiques/globales')
  getStatistiques() {
    return this.materiauService.getStatistiques();
  }

  // ✅ Forcer la commande automatique si stock < seuil
  @Post('commande-auto')
  commanderAutomatiquement() {
    return this.materiauService.verifierEtCommanderSiNecessaire();
  }
}
