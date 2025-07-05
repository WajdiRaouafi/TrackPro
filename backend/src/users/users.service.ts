import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

 async create(data: Partial<User>): Promise<User> {
  if (!data.email || !data.password || !data.role) {
    throw new BadRequestException('Email, mot de passe et rôle sont requis.');
  }

  const existing = await this.userRepository.findOneBy({ email: data.email });
  if (existing) {
    throw new BadRequestException(`Un utilisateur avec l'email "${data.email}" existe déjà.`);
  }

  data.password = await bcrypt.hash(data.password, 10);

  const user = this.userRepository.create(data);
  return this.userRepository.save(user);
}



  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: number, userData: Partial<User>) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}