import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , IsNull} from 'typeorm';
import { User, UserRole } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    if (!data.email || !data.password || !data.role) {
      throw new BadRequestException('Email, mot de passe et rôle sont requis.');
    }

    const existing = await this.userRepository.findOneBy({ email: data.email });
    if (existing) {
      throw new BadRequestException(
        `Un utilisateur avec l'email "${data.email}" existe déjà.`,
      );
    }

    if (data.role === UserRole.MEMBRE_EQUIPE && !data.salaireJournalier) {
      throw new BadRequestException(
        "Le salaire journalier est requis pour les membres d'équipe.",
      );
    }

    data.password = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create(data);
    const saved = await this.userRepository.save(user);
    return plainToInstance(User, saved);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({ relations: ['equipe'] });
    return users.map((user) => plainToInstance(User, user));
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['equipe'],
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return plainToInstance(User, user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findByNameOrEmail(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { prenom: identifier }],
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (typeof data.isActive === 'string') {
      data.isActive = data.isActive === 'true';
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    const updated = await this.userRepository.save(user);
    return plainToInstance(User, updated);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.userRepository.delete(id);
  }

  async countActiveUsers(): Promise<number> {
    return this.userRepository.count({ where: { isActive: true } });
  }

  async countTotalUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async countUsersByRole(): Promise<{ [role: string]: number }> {
    const users = await this.userRepository.find();
    const roleCounts: { [role: string]: number } = {};

    users.forEach((user) => {
      const role = user.role || 'INCONNU';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    return roleCounts;
  }

  async findAvailableMembers(): Promise<User[]> {
    const membres = await this.userRepository.find({
      where: {
        role: UserRole.MEMBRE_EQUIPE,
        projetActuelId: IsNull(),
      },
    });

    return membres.map((m) => plainToInstance(User, m));
  }

  async toggleActivation(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    const saved = await this.userRepository.save(user);
    return plainToInstance(User, saved);
  }
}
