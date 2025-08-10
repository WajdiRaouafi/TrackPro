import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { Equipement } from './entities/equipement.entity';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';

@Injectable()
export class EquipementService {
  constructor(
    @InjectRepository(Equipement)
    private readonly equipementRepo: Repository<Equipement>,
  ) {}

  // ✅ Créer un équipement
  async create(dto: CreateEquipementDto): Promise<Equipement> {
    const equipement = this.equipementRepo.create(dto);
    return await this.equipementRepo.save(equipement);
  }

  // ✅ Récupérer tous les équipements
  async findAll(): Promise<Equipement[]> {
    return await this.equipementRepo.find({ relations: ['projet'] });
  }

  // ✅ Trouver un équipement par ID
  async findOne(id: number): Promise<Equipement> {
    const equipement = await this.equipementRepo.findOne({
      where: { id },
      relations: ['projet'],
    });
    if (!equipement) throw new NotFoundException('Équipement introuvable');
    return equipement;
  }

  // ✅ Mettre à jour un équipement
  async update(id: number, dto: UpdateEquipementDto): Promise<Equipement> {
    const equipement = await this.findOne(id);
    const updated = Object.assign(equipement, dto);
    return await this.equipementRepo.save(updated);
  }

  // ✅ Supprimer
  async remove(id: number): Promise<void> {
    const equipement = await this.findOne(id);
    await this.equipementRepo.remove(equipement);
  }

  // ✅ Alerte si stock < seuil
  async findEquipementsEnAlerte(): Promise<Equipement[]> {
    const equipements = await this.equipementRepo.find();
    return equipements.filter((e) => e.stock < e.seuil);
  }

  // ✅ Approvisionnement proche (dans les 7 jours)
  async findEquipementsApprovisionnementProche(): Promise<Equipement[]> {
    const today = new Date();
    const dans7Jours = new Date();
    dans7Jours.setDate(today.getDate() + 7);

    return this.equipementRepo.find({
      where: {
        dateProchainApprovisionnement: LessThan(dans7Jours),
      },
    });
  }

  // ✅ Coût total d’utilisation
  async calculerCoutTotal(): Promise<{ total: number }> {
    const equipements = await this.equipementRepo.find();
    const total = equipements.reduce(
      (sum, eq) => sum + eq.coutParJour * eq.joursUtilisation,
      0,
    );
    return { total };
  }

  // ✅ Utilisé pour suivi stock/cout si besoin futur
  async getStatistiques(): Promise<{
    totalEquipements: number;
    coutTotal: number;
    alertesStock: number;
    approvisionnementProche: number;
  }> {
    const [tous, alertes, approvisionnement] = await Promise.all([
      this.equipementRepo.find(),
      this.findEquipementsEnAlerte(),
      this.findEquipementsApprovisionnementProche(),
    ]);

    const coutTotal = tous.reduce(
      (acc, eq) => acc + eq.coutParJour * eq.joursUtilisation,
      0,
    );

    return {
      totalEquipements: tous.length,
      coutTotal,
      alertesStock: alertes.length,
      approvisionnementProche: approvisionnement.length,
    };
  }

  async getNotifications(): Promise<{
    alertesStock: Equipement[];
    approvisionnementProche: Equipement[];
  }> {
    const [alertesStock, approvisionnementProche] = await Promise.all([
      this.findEquipementsEnAlerte(),
      this.findEquipementsApprovisionnementProche(),
    ]);
    return { alertesStock, approvisionnementProche };
  }
}
