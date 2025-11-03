// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { UsersModule } from './modules/users/users.module'; // <-- Solo una vez
import { AuthModule } from './modules/auth/auth.module';   // <-- Solo una vez
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Configuración de PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Tu usuario de Postgres
      password: 'admin',    // Tu contraseña de Postgres
      database: 'archivosya', // El nombre de la base de datos
      
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),
    
    // Nuestros módulos (solo una vez cada uno)
    FilesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}