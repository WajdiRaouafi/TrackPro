import { Controller, Get, Post, Body, Param, Patch, Delete,UseGuards,Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto'; // Assurez-vous que ce DTO est créé pour la validation des données d'entrée
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() user: Partial<User>) {
  //   return this.usersService.create(user);
  // }

  @Post()
  create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
@UseGuards(JwtAuthGuard)
@Patch('me')
updateOwnProfile(@Request() req, @Body() data: Partial<User>) {
  const allowedFields = ['nom', 'prenom', 'telephone'];
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key))
  );
  return this.usersService.update(req.user.id, filtered);
}


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() user: Partial<User>) {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}