import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/projects.entity';
import { User } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User])], // 🔑 ajoute cette ligne !
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService], // si utilisé ailleurs (ex: dans un autre module)
})
export class ProjectsModule {}
