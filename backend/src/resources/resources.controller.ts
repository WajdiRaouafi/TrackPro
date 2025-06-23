import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post('equipement')
  createEquipement(@Body() data: any) {
    return this.resourcesService.createEquipement(data);
  }

  @Get('equipement')
  findAllEquipements() {
    return this.resourcesService.findAllEquipements();
  }

  @Post('materiau')
  createMateriau(@Body() data: any) {
    return this.resourcesService.createMateriau(data);
  }

  @Get('materiau')
  findAllMateriaux() {
    return this.resourcesService.findAllMateriaux();
  }
}