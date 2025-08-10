import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/tasks.entity';
import { User } from 'src/users/entities/users.entity';
import { Project } from 'src/projects/entities/projects.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Task, User , Project])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
