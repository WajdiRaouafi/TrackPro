import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // 🔑 c'est ça qui manque
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // utile si d'autres modules (ex: Auth) ont besoin de UsersService
})
export class UsersModule {}
