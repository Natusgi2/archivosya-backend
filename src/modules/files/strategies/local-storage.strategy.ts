// src/modules/files/strategies/local-storage.strategy.ts
import { Injectable } from '@nestjs/common';
import { IStorageStrategy } from '../interfaces/storage-strategy.interface.js';
import * as fs from 'fs/promises'; // Módulo de Node.js para archivos
import * as path from 'path';       // Módulo de Node.js para rutas
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageStrategy implements IStorageStrategy {
  
  // Carpeta donde guardaremos los archivos (en la raíz del proyecto)
  private storagePath = path.resolve('./uploads');

  constructor() {
    // Asegurarse de que la carpeta 'uploads' exista
    fs.mkdir(this.storagePath, { recursive: true });
  }

  async save(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const destination = path.join(this.storagePath, uniqueFilename);

    // Guardar el buffer del archivo en el disco
    await fs.writeFile(destination, file.buffer);

    // Devolvemos el nombre del archivo guardado
    return uniqueFilename;
  }
}