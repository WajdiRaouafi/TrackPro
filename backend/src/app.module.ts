import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { GptModule } from './gpt/gpt.module';
import { EquipeModule } from './equipe/equipe.module';
import { AffectationMembreProjetModule } from './affectation-membre-projet/affectation-membre-projet.module';
import { EquipementModule } from './equipement/equipement.module';
import { MateriauModule } from './materiau/materiau.module';
import { FournisseursModule } from './fournisseur/fournisseurs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ désactiver en prod
      }),
    }),

    // ✅ Mailer (SMTP)
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     const port = Number(config.get('MAIL_PORT')) || 587;
    //     const secure =
    //       config.get('MAIL_SECURE') === 'true' || port === 465; // true pour 465
    //     return {
    //       transport: {
    //         host: config.get<string>('MAIL_HOST'),
    //         port,
    //         secure,
    //         auth: {
    //           user: config.get<string>('MAIL_USER'),
    //           pass: config.get<string>('MAIL_PASS'),
    //         },
    //       },
    //       defaults: {
    //         from: `"${config.get('MAIL_FROM_NAME') || 'TrackPro'}" <${
    //           config.get('MAIL_FROM') || config.get('MAIL_USER')
    //         }>`,
    //       },
    //       // templates: { ... } // (optionnel) si tu veux Handlebars/ejs
    //     };
    //   },
    // }),

    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    GptModule,
    EquipeModule,
    AffectationMembreProjetModule,
    EquipementModule,
    MateriauModule,
    FournisseursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
