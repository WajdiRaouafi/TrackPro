import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Activer CORS pour le frontend React
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // ✅ Servir les fichiers statiques (uploads d'images, etc.)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Port dynamique ou par défaut
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Backend is running on http://localhost:${port}`);
}
bootstrap();
