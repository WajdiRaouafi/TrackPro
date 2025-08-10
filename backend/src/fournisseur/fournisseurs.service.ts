// src/fournisseurs/fournisseurs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Fournisseur } from './entities/fournisseur.entity';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';

@Injectable()
export class FournisseursService {
  constructor(
    @InjectRepository(Fournisseur) private repo: Repository<Fournisseur>,
  ) {}

  create(dto: CreateFournisseurDto) {
    const f = this.repo.create(dto);
    return this.repo.save(f);
  }

  findAll(q?: string) {
    if (q) {
      return this.repo.find({
        where: [{ nom: ILike(`%${q}%`) }, { email: ILike(`%${q}%`) }],
        order: { nom: 'ASC' },
      });
    }
    return this.repo.find({ order: { nom: 'ASC' } });
  }

  async findOne(id: number) {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundException('Fournisseur introuvable');
    return f;
  }

  async update(id: number, dto: UpdateFournisseurDto) {
    const f = await this.findOne(id);
    Object.assign(f, dto);
    return this.repo.save(f);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
