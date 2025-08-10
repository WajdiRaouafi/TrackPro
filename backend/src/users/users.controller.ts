import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Créer un utilisateur avec photo
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Type de fichier non autorisé'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const data = {
      ...body,
      photoUrl: file ? `/uploads/profile/${file.filename}` : undefined,
    };
    const user = await this.usersService.create(data);
    return plainToInstance(User, user);
  }

  // ✅ Récupérer tous les utilisateurs
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => plainToInstance(User, u));
  }

  // ✅ Récupérer un utilisateur par ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(User, user);
  }

  // ✅ Mettre à jour un utilisateur par ID
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Type de fichier non autorisé'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
  ) {
    const data = {
      ...body,
      photoUrl: file ? `/uploads/profile/${file.filename}` : body.photoUrl,
    };
    const updated = await this.usersService.update(id, data);
    return plainToInstance(User, updated);
  }

  // ✅ Supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // ✅ Mettre à jour son propre profil
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateOwnProfile(@Request() req, @Body() data: Partial<User>) {
    const allowedFields = ['nom', 'prenom', 'telephone', 'photoUrl'];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key)),
    );
    const updated = await this.usersService.update(req.user.id, filtered);
    return plainToInstance(User, updated);
  }

  // ✅ Upload de la photo seule
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Type de fichier non autorisé'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) throw new BadRequestException('Aucun fichier reçu.');
    const photoUrl = `/uploads/profile/${file.filename}`;
    const updated = await this.usersService.update(req.user.id, { photoUrl });
    return {
      message: '✅ Photo téléchargée avec succès',
      photoUrl,
      user: plainToInstance(User, updated),
    };
  }

  // ✅ Récupérer les membres disponibles
  @Get('disponibles')
  async findAvailable() {
    const users = await this.usersService.findAvailableMembers();
    return users.map((u) => plainToInstance(User, u));
  }
}
