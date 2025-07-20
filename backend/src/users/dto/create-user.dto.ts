import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../users.entity';

export class CreateUserDto {
  @IsNotEmpty()
  nom: string;

  @IsNotEmpty()
  prenom: string;

  @IsNotEmpty()
  telephone: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
