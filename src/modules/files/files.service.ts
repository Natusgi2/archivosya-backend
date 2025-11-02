// src/modules/files/files.service.ts

import { Inject, Injectable } from '@nestjs/common';
// Importamos la INTERFAZ como un tipo
import type { IStorageStrategy } from './interfaces/storage-strategy.interface';
import { Express } from 'express'; // Importante para el tipo 'Multer.File'

@Injectable()
export class FilesService {
  
  constructor(
    @Inject('IStorageStrategy') // Pedimos el token
    private readonly storageStrategy: IStorageStrategy,
    
    // @Inject('IFileRepository') 
    // private readonly fileRepository: IFileRepository, // Esto sigue comentado
  ) {}

  async handleFileUpload(file: Express.Multer.File) {
    // 1. Guardar el archivo físico usando la Estrategia
    const savedPath = await this.storageStrategy.save(file);

    // 2. (Próximo paso) Guardar los metadatos en la BD...
    // ...

    console.log('Archivo guardado en:', savedPath);
    return {
      message: 'Archivo subido y guardado exitosamente',
      path: savedPath,
    };
  }
}