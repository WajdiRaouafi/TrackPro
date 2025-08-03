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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Créer un nouvel utilisateur avec image (FormData)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type de fichier non autorisé'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const userData = {
      ...body,
      photoUrl: file ? `/uploads/profile/${file.filename}` : undefined,
    };

    return this.usersService.create(userData);
  }

  // ✅ Mise à jour de son propre profil (nom, prénom, téléphone, photo)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateOwnProfile(@Request() req, @Body() data: Partial<User>) {
    const allowedFields = ['nom', 'prenom', 'telephone', 'photoUrl'];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key)),
    );
    return this.usersService.update(req.user.id, filtered);
  }

  // ✅ Upload de la photo de profil seule (authentifié)
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type de fichier non autorisé'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu.');
    }

    const photoUrl = `/uploads/profile/${file.filename}`;
    await this.usersService.update(req.user.id, { photoUrl });

    return {
      message: '✅ Photo téléchargée avec succès',
      photoUrl,
    };
  }

  // ✅ Récupérer tous les utilisateurs
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ✅ Récupérer un utilisateur par ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  // ✅ Modifier un utilisateur (admin)
  @Patch(':id')
  update(@Param('id') id: number, @Body() user: Partial<User>) {
    return this.usersService.update(id, user);
  }

  // ✅ Supprimer un utilisateur
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
