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

  // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
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
  const jwtService = app.get(JwtService);
  const usersService = app.get(UsersService);
  app.useWebSocketAdapter(new WsAuthAdapter(app, jwtService, usersService));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('ArchivosYa API')
    .setDescription('Documentación de la API para el proyecto ArchivosYa S.A.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();