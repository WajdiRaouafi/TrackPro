import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../users.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
