// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// --- Importa esto ---
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Añade este bloque de configuración ---
  const config = new DocumentBuilder()
    .setTitle('ArchivosYa API')
    .setDescription('Documentación de la API para el proyecto ArchivosYa S.A.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // --- Fin del bloque ---

  await app.listen(3000);
}
bootstrap();