import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { User } from 'src/users/users.entity';
import { Project } from 'src/projects/projects.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Task, User , Project])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
