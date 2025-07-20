import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // async validateUser(email: string, password: string): Promise<any> {
  //   const user = await this.usersService.findByEmail(email);
  //   if (user && await bcrypt.compare(password, user.password)) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   throw new UnauthorizedException('Invalid credentials');
  // }

  async validateUser(email: string, password: string): Promise<any> {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Utilisateur introuvable');
  }

  if (!user.isActive) {
    throw new UnauthorizedException('Compte désactivé par l\'administrateur');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedException('Mot de passe invalide');
  }

  const { password: _, ...result } = user;
  return result;
}


  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}