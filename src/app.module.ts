// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Módulo para variables de entorno (buena práctica)

    // Configuración de PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Tu usuario de Postgres
      password: 'admin',    // Tu contraseña de Postgres (de Docker)
      database: 'archivosya', // El nombre de la base de datos (de Docker)
      
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      
      // Sincroniza las tablas automáticamente (¡solo para desarrollo!)
      synchronize: true, 
    }),
    
    // Nuestros módulos
    FilesModule,
    CollaborationModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}