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

@Module({
  imports: [
    ConfigModule.forRoot(),

    // Configuración de PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'archivosya',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    
    // --- REGISTRO DE MÓDULOS ---
    // ¡Aquí se registran los módulos para que Nest los reconozca!
    FilesModule,
    CollaborationModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

