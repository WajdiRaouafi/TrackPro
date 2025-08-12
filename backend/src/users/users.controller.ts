// users.controller.ts
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
import { extname, join } from 'path';
import * as fs from 'fs';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from './entities/users.entity';

// === Dossiers d'upload unifiés ===
const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const PROFILE_DIR = join(UPLOADS_ROOT, 'profile');
// Créer les dossiers si absents
fs.mkdirSync(PROFILE_DIR, { recursive: true });

// Générateur de nom de fichier
function makeFilename(original: string) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(original || '') || '.png';
  return `photo-${unique}${ext}`;
}

// Config Multer commune
const multerProfileConfig = {
  storage: diskStorage({
    destination: PROFILE_DIR,
    filename: (req, file, cb) => cb(null, makeFilename(file.originalname)),
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new BadRequestException('Type de fichier non autorisé'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
};

// Petite fonction de nettoyage des champs côté controller
function sanitizeBody(body: any) {
  const sanitized: any = { ...body };

  // Ne jamais envoyer '' vers une colonne DECIMAL (Postgres n'aime pas)
  if (sanitized.role !== 'MEMBRE_EQUIPE') {
    delete sanitized.salaireJournalier;
  } else if (sanitized.salaireJournalier === '') {
    delete sanitized.salaireJournalier;
  }

  // Si photoUrl est '', on n’écrase pas la valeur existante
  if (sanitized.photoUrl === '') {
    delete sanitized.photoUrl;
  }

  // Normaliser isActive (string -> boolean)
  if (typeof sanitized.isActive === 'string') {
    sanitized.isActive =
      sanitized.isActive === 'true' || sanitized.isActive === '1';
  }

  return sanitized;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Créer un utilisateur avec photo
  @Post()
  @UseInterceptors(FileInterceptor('photo', multerProfileConfig))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const data = sanitizeBody(body);
    if (file) {
      // On stocke l'URL web (pas un chemin disque)
      data.photoUrl = `/uploads/profile/${file.filename}`;
    }
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

  // ✅ Mettre à jour un utilisateur par ID (avec photo optionnelle)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', multerProfileConfig))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
  ) {
    const data: any = sanitizeBody(body);
    if (file) {
      data.photoUrl = `/uploads/profile/${file.filename}`;
    }
    const updated = await this.usersService.update(id, data);
    return plainToInstance(User, updated);
  }

  // ✅ Supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // ✅ Mettre à jour son propre profil (sans forcer des champs sensibles)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateOwnProfile(@Request() req, @Body() data: Partial<User>) {
    const allowed = ['nom', 'prenom', 'telephone', 'photoUrl'];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k)),
    );
    const updated = await this.usersService.update(req.user.id, filtered);
    return plainToInstance(User, updated);
  }

  // ✅ Upload de la photo seule (si tu veux un endpoint dédié)
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('photo', multerProfileConfig))
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

  // ✅ Membres disponibles (si présent côté service)
  @Get('disponibles')
  async findAvailable() {
    const users = await this.usersService.findAvailableMembers();
    return users.map((u) => plainToInstance(User, u));
  }
}
