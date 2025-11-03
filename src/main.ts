// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // <-- Importa esto

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Habilita la validación global para DTOs ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve campos que no están en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay campos no permitidos
    transform: true, // Transforma los tipos (ej. string a number)
  }));
  // --- Fin del bloque de validación ---

  const config = new DocumentBuilder()
    .setTitle('ArchivosYa API')
    .setDescription('Documentación de la API para el proyecto ArchivosYa S.A.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();