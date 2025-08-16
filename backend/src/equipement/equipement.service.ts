import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Equipement } from './entities/equipement.entity';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';

/* ---------- Helpers dates robustes ---------- */
function startOfUtcDay(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}
function addDaysUtc(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function stockMessage(stock: number, seuil: number) {
  if (stock <= 0) return 'Stock épuisé, commande urgente.';
  if (stock <= Math.max(1, Math.floor(seuil / 2)))
    return 'Risque de rupture, réappro à planifier.';
  return 'Stock presque épuisé, pensez à réapprovisionner.';
}

/** YYYY-MM-DD en UTC (utile si colonne DB = DATE) */
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
/** Accepte Date | string | null et renvoie Date | null */
function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function diffDaysUtc(from: Date, to: Date) {
  const a = startOfUtcDay(from).getTime();
  const b = startOfUtcDay(to).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class EquipementService {
  constructor(
    @InjectRepository(Equipement)
    private readonly equipementRepo: Repository<Equipement>,
  ) {}

  /* ---------- CRUD ---------- */

  async create(dto: CreateEquipementDto): Promise<Equipement> {
    const equipement = this.equipementRepo.create(dto);
    return await this.equipementRepo.save(equipement);
  }

  async findAll(): Promise<Equipement[]> {
    return await this.equipementRepo.find({ relations: ['projet'] });
  }

  async findOne(id: number): Promise<Equipement> {
    const equipement = await this.equipementRepo.findOne({
      where: { id },
      relations: ['projet'],
    });
    if (!equipement) throw new NotFoundException('Équipement introuvable');
    return equipement;
  }

  async update(id: number, dto: UpdateEquipementDto): Promise<Equipement> {
    const equipement = await this.findOne(id);
    const updated = Object.assign(equipement, dto);
    return await this.equipementRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const equipement = await this.findOne(id);
    await this.equipementRepo.remove(equipement);
  }

  /* ---------- Métiers ---------- */

  // Alerte: stock < seuil (null-safe) + relation projet
  async findEquipementsEnAlerte(): Promise<Equipement[]> {
    return this.equipementRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.projet', 'projet')
      .where('COALESCE(e.stock, 0) < COALESCE(e.seuil, 0)')
      .orderBy('e.id', 'DESC') // stable sans updatedAt
      .getMany();
  }

  // Approvisionnement proche: [aujourd’hui ; aujourd’hui + days]
  // Colonne DB = DATE → on passe des bornes 'YYYY-MM-DD'
  async findEquipementsApprovisionnementProche(
    days = 7,
  ): Promise<Equipement[]> {
    const today = startOfUtcDay(new Date());
    const end = addDaysUtc(today, Math.max(0, days));

    return this.equipementRepo.find({
      where: {
        dateProchainApprovisionnement: Between(today, end), // ✅ Date au lieu de string
      },
      relations: ['projet'],
      order: { dateProchainApprovisionnement: 'ASC' },
    });
  }

  // Coût total (null-safe)
  async calculerCoutTotal(): Promise<{ total: number }> {
    const equipements = await this.equipementRepo.find();
    const total = equipements.reduce((sum, eq) => {
      const c = Number(eq.coutParJour) || 0;
      const j = Number(eq.joursUtilisation) || 0;
      return sum + c * j;
    }, 0);
    return { total };
  }

  // Statistiques globales
  async getStatistiques(): Promise<{
    totalEquipements: number;
    coutTotal: number;
    alertesStock: number;
    approvisionnementProche: number;
  }> {
    const [tous, alertes, appro] = await Promise.all([
      this.equipementRepo.find(),
      this.findEquipementsEnAlerte(),
      this.findEquipementsApprovisionnementProche(),
    ]);

    const coutTotal = tous.reduce((acc, eq) => {
      const c = Number(eq.coutParJour) || 0;
      const j = Number(eq.joursUtilisation) || 0;
      return acc + c * j;
    }, 0);

    return {
      totalEquipements: tous.length,
      coutTotal,
      alertesStock: alertes.length,
      approvisionnementProche: appro.length,
    };
  }

  /* ---------- Notifications front-ready (avec message) ---------- */
  async getNotifications(days = 7): Promise<{
    alertesStock: Array<{
      id: number;
      nom: string;
      type?: string | null;
      numeroSerie?: string | null;
      projet: { id: number; nom: string } | null;
      stock: number;
      seuil: number;
      createdAt: string;
      message: string; // 👈 ajouté
    }>;
    approvisionnementProche: Array<{
      id: number;
      nom: string;
      type?: string | null;
      numeroSerie?: string | null;
      projet: { id: number; nom: string } | null;
      dateProchainApprovisionnement: string | null;
      joursRestants?: number;
      createdAt: string;
      message: string; // 👈 ajouté
    }>;
    meta: { daysWindow: number; generatedAt: string };
  }> {
    const today = startOfUtcDay(new Date());
    const end = addDaysUtc(
      today,
      Math.max(0, Number.isFinite(days as any) ? Number(days) : 7),
    );
    const nowIso = new Date().toISOString();

    const [stock, appro] = await Promise.all([
      this.findEquipementsEnAlerte(),
      this.findEquipementsApprovisionnementProche(days),
    ]);

    const alertesStock = stock.map((e) => {
      const s = Number(e.stock ?? 0);
      const th = Number(e.seuil ?? 0);
      return {
        id: e.id,
        nom: e.nom,
        type: e.type ?? null,
        numeroSerie: e.numeroSerie ?? null,
        projet: e.projet ? { id: e.projet.id, nom: e.projet.nom } : null,
        stock: s,
        seuil: th,
        createdAt: nowIso, // pas de updatedAt → timestamp de génération
        message: stockMessage(s, th), // 👈 petit message simple
      };
    });

    const approvisionnementProche = appro.map((e) => {
      const d = toDate(e.dateProchainApprovisionnement);
      const jr = d ? diffDaysUtc(today, d) : undefined;

      // 👇 message court et clair selon le nombre de jours
      let message = 'Approvisionnement à venir.';
      if (typeof jr === 'number') {
        if (jr < 0)
          message = 'Approvisionnement en retard, contactez le fournisseur.';
        else if (jr === 0) message = 'Livraison prévue aujourd’hui.';
        else if (jr === 1)
          message = 'Livraison prévue demain, vérifiez la réception.';
        else
          message = `Livraison prévue dans ${jr} jours, vérifiez le planning.`;
      }

      return {
        id: e.id,
        nom: e.nom,
        type: e.type ?? null,
        numeroSerie: e.numeroSerie ?? null,
        projet: e.projet ? { id: e.projet.id, nom: e.projet.nom } : null,
        dateProchainApprovisionnement: d ? d.toISOString() : null,
        joursRestants: jr,
        createdAt: nowIso,
        message, // 👈 petit message simple
      };
    });

    return {
      alertesStock: alertesStock.sort((a, b) => b.id - a.id),
      approvisionnementProche, // déjà trié par la requête
      meta: {
        daysWindow: diffDaysUtc(today, end),
        generatedAt: nowIso,
      },
    };
  }
}
