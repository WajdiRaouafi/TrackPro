// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Charger .env en amont
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS pour Vite (5173/5174) + FRONTEND_URL optionnelle (liste séparée par virgules)
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
    : [];

  app.enableCors({
    origin: [...defaultOrigins, ...envOrigins],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // === Publication des fichiers statiques ===
  // Utilise toujours la racine du projet : <racine>/uploads
  const UPLOADS_ROOT = join(process.cwd(), 'uploads');
  // Ensure directory exists
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

  app.useStaticAssets(UPLOADS_ROOT, {
    prefix: '/uploads', // => http://localhost:3000/uploads/...
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Backend is running on http://localhost:${port}`);
  // console.log(`📂 Serving uploads from: ${UPLOADS_ROOT}`);
}
bootstrap();
