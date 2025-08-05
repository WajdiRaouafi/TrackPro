import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ResourcesModule } from './resources/resources.module';
import { GptModule } from './gpt/gpt.module'; // ✅ Import du module GPT

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ✅
      inject: [ConfigService], // ✅
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ désactive-le en production
      }),
    }),

    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ResourcesModule,
    GptModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
