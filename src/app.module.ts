import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { UsersModule } from './modules/users/users.module'; 
import { AuthModule } from './modules/auth/auth.module';     
import { PermissionsModule } from './modules/permissions/permissions.module'; 
import { ConfigModule } from '@nestjs/config';

@Module({// Decorador que define un módulo de NestJS
  imports: [
    ConfigModule.forRoot(), // Carga las variables de entorno desde un archivo .env

    // Configuración de PostgreSQL
    TypeOrmModule.forRoot({ // Configura la conexión a la base de datos usando TypeORM
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'archivosya',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Sincroniza automáticamente la base de datos con las entidades (útil en desarrollo)
    }), 
    
    // --- REGISTRO DE MÓDULOS ---
    // ¡Aquí se registran los módulos para que Nest los reconozca!
    FilesModule,
    CollaborationModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
  ],
  controllers: [AppController], // Controladores del módulo principal
  providers: [AppService], // Servicios del módulo principal
})
export class AppModule {}

