// src/gpt/gpt.module.ts
import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { UsersModule } from 'src/users/users.module';
import { ProjectsModule } from 'src/projects/projects.module'; // Import ProjectsModule

@Module({
  imports: [UsersModule,ProjectsModule], // ✅ Ajouter ici
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
