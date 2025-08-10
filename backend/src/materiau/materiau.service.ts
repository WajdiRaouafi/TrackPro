import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materiau } from './entities/materiau.entity';
import { CreateMateriauDto } from './dto/create-materiau.dto';
import { UpdateMateriauDto } from './dto/update-materiau.dto';
import { Project } from 'src/projects/entities/projects.entity';
import { Fournisseur } from 'src/fournisseur/entities/fournisseur.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MateriauService {
  private readonly logger = new Logger(MateriauService.name);

  constructor(
    @InjectRepository(Materiau)
    private readonly materiauRepo: Repository<Materiau>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Fournisseur)
    private readonly fournisseurRepo: Repository<Fournisseur>,

    private readonly mailer: MailerService,
  ) {}

  // ✅ Créer un matériau (projet/fournisseur optionnels)
  async create(dto: CreateMateriauDto): Promise<Materiau> {
    const materiau = this.materiauRepo.create({ ...dto });

    // Lier projet si fourni
    if (dto.projetId) {
      const project = await this.projectRepo.findOne({ where: { id: dto.projetId } });
      if (!project) throw new NotFoundException('Projet non trouvé');
      materiau.projet = project;
    }

    // Lier fournisseur si fourni
    if (dto.fournisseurId) {
      const fournisseur = await this.fournisseurRepo.findOne({ where: { id: dto.fournisseurId } });
      if (!fournisseur) throw new NotFoundException('Fournisseur non trouvé');
      materiau.fournisseur = fournisseur;
    }

    return this.materiauRepo.save(materiau);
  }

  // ✅ Tous les matériaux (avec relations)
  async findAll(): Promise<Materiau[]> {
    return this.materiauRepo.find({ relations: ['projet', 'fournisseur'] });
  }

  // ✅ Un matériau par ID (avec relations)
  async findOne(id: number): Promise<Materiau> {
    const materiau = await this.materiauRepo.findOne({
      where: { id },
      relations: ['projet', 'fournisseur'],
    });
    if (!materiau) throw new NotFoundException('Matériau introuvable');
    return materiau;
  }

  // ✅ Mettre à jour (projet/fournisseur optionnels)
  async update(id: number, dto: UpdateMateriauDto): Promise<Materiau> {
    const materiau = await this.findOne(id);

    // Projet : peut être défini, changé ou annulé (null)
    if (dto.projetId !== undefined) {
      if (dto.projetId === null) {
        materiau.projet = null;
      } else {
        const project = await this.projectRepo.findOne({ where: { id: dto.projetId } });
        if (!project) throw new NotFoundException('Projet non trouvé');
        materiau.projet = project;
      }
    }

    // Fournisseur : peut être défini, changé ou annulé (null)
    if (dto.fournisseurId !== undefined) {
      if (dto.fournisseurId === null) {
        materiau.fournisseur = null;
      } else {
        const fournisseur = await this.fournisseurRepo.findOne({ where: { id: dto.fournisseurId } });
        if (!fournisseur) throw new NotFoundException('Fournisseur non trouvé');
        materiau.fournisseur = fournisseur;
      }
    }

    Object.assign(materiau, dto);

    // Astuce: si le stock repasse au-dessus du seuil, on peut réarmer la commande
    const stock = Number(materiau.stock ?? 0);
    const seuil = Number(materiau.seuil ?? 0);
    if (stock >= seuil && materiau.commandeEnvoyee) {
      materiau.commandeEnvoyee = false;
    }

    return this.materiauRepo.save(materiau);
  }

  // ✅ Supprimer
  async remove(id: number): Promise<void> {
    const materiau = await this.findOne(id);
    await this.materiauRepo.remove(materiau);
  }

  // ✅ Commande auto si stock < seuil et commande non envoyée
  // Renvoie { commandesEnvoyees: number }
  async verifierEtCommanderSiNecessaire(): Promise<{ commandesEnvoyees: number }> {
    // On a besoin du fournisseur et projet pour l'email
    const materiaux = await this.materiauRepo.find({
      where: { commandeEnvoyee: false },
      relations: ['fournisseur', 'projet'],
    });

    let count = 0;

    for (const m of materiaux) {
      const stock = Number(m.stock ?? 0);
      const seuil = Number(m.seuil ?? 0);

      if (stock < seuil && m.fournisseur?.email) {
        try {
          await this.mailer.sendMail({
            to: m.fournisseur.email,
            subject: `Commande automatique – ${m.nom}`,
            html: this.buildCommandeHtml(m),
          });

          m.commandeEnvoyee = true;
          await this.materiauRepo.save(m);
          count += 1;
        } catch (err) {
          this.logger.error(
            `Échec envoi email fournisseur(${m.fournisseur.email}) pour matériau ${m.id}: ${err?.message || err}`,
          );
          // On ne marque PAS comme envoyé si l'email échoue
        }
      }
    }

    return { commandesEnvoyees: count };
  }

  private buildCommandeHtml(m: Materiau) {
    const appro = m.dateProchainApprovisionnement
      ? new Date(m.dateProchainApprovisionnement).toISOString().slice(0, 10)
      : '-';
    const projet = m.projet?.nom ? m.projet.nom : '-';

    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
        <p>Bonjour ${m.fournisseur?.contact || m.fournisseur?.nom || ''},</p>
        <p>Suite à la surveillance de nos stocks, nous souhaitons passer la commande suivante :</p>
        <ul>
          <li><strong>Matériau :</strong> ${m.nom} (${m.type})</li>
          <li><strong>Stock actuel :</strong> ${m.stock}</li>
          <li><strong>Seuil minimum :</strong> ${m.seuil}</li>
          <li><strong>Coût unitaire estimé :</strong> ${m.coutUnitaire ?? '-' } $</li>
          <li><strong>Projet :</strong> ${projet}</li>
          <li><strong>Prochain approvisionnement souhaité :</strong> ${appro}</li>
        </ul>
        <p>Merci de nous confirmer la disponibilité, le délai de livraison et le devis.</p>
        <p>Cordialement,<br/>TrackPro – Approvisionnement</p>
      </div>
    `;
  }

  // ✅ Statistiques complètes pour le dashboard
  async getStatistiques(): Promise<{
    total: number;
    sousSeuil: number;
    rupture: number;
    commandesEnvoyees: number;
    valeurTotaleStock: number;
  }> {
    const materiaux = await this.materiauRepo.find();

    let sousSeuil = 0;
    let rupture = 0;
    let commandesEnvoyees = 0;
    let valeurTotaleStock = 0;

    for (const m of materiaux) {
      const stock = Number(m.stock ?? 0);
      const seuil = Number(m.seuil ?? 0);
      const coutUnitaire = Number(m.coutUnitaire ?? 0);

      if (stock <= 0) rupture += 1;
      else if (stock < seuil) sousSeuil += 1;

      if (m.commandeEnvoyee) commandesEnvoyees += 1;

      valeurTotaleStock += stock * coutUnitaire;
    }

    return {
      total: materiaux.length,
      sousSeuil,
      rupture,
      commandesEnvoyees,
      valeurTotaleStock: Number(valeurTotaleStock.toFixed(2)),
    };
  }
}
