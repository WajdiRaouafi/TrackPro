import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])], // 🔑 ajoute cette ligne !
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService], // si utilisé ailleurs (ex: dans un autre module)
})
export class ProjectsModule {}
