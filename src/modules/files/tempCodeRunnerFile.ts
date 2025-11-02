// src/modules/files/files.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files') // Esto define la ruta base: /api/files
export class FilesController {

  // NestJS inyecta el servicio automáticamente (Inyección de Dependencias)
  constructor(private readonly filesService: FilesService) {}

  @Post('upload') // Esto crea el endpoint: POST /api/files/upload
  @UseInterceptors(FileInterceptor('file')) // Middleware para manejar la subida
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    
    console.log(file); // Aquí reciben el archivo
    
    // Aquí llamarán a su servicio, que usará el Patrón Strategy
    // return this.filesService.handleFileUpload(file);

    return {
      message: 'Archivo recibido, lógica de MVP pendiente',
      filename: file.originalname,
    };
  }
}