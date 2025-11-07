// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WsAuthAdapter } from './modules/auth/ws-auth.adapter';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  // Habilita CORS para permitir peticiones desde tu frontend
  app.enableCors({
    origin: 'http://127.0.0.1:5500', // La dirección de tu Live Server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // --- Fin del bloque de CORS ---

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar el Adaptador de WebSocket
  const jwtService = app.get(JwtService); // Obtener instancia de JwtService
  const usersService = app.get(UsersService); // Obtener instancia de UsersService
  app.useWebSocketAdapter(new WsAuthAdapter(app, jwtService, usersService)); // Pasar las instancias al adaptador de WebSocket 

  // Configurar Swagger
  const config = new DocumentBuilder() // Crear una nueva instancia de DocumentBuilder
    .setTitle('ArchivosYa API') // Título de la API
    .setDescription('Documentación de la API para el proyecto ArchivosYa S.A.') // Descripción de la API
    .setVersion('1.0')
    .addBearerAuth() // Habilitar autenticación Bearer
    .build(); // Construir la configuración de Swagger
  const document = SwaggerModule.createDocument(app, config); // Crear el documento de Swagger
  SwaggerModule.setup('api-docs', app, document); // Configurar la ruta para acceder a la documentación de Swagger

  await app.listen(3000); // Iniciar la aplicación en el puerto 3000
}
bootstrap(); // Llamar a la función bootstrap para iniciar la aplicación