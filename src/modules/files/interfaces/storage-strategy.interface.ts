/* // src/modules/files/interfaces/storage-strategy.interface.ts
export interface IStorageStrategy {
  save(file: Express.Multer.File): Promise<string>; // Devuelve la ruta o URL
}

// src/modules/files/interfaces/file-repository.interface.ts
import { File } from '../entities/file.entity'; // (Crearemos esta entidad luego)

export interface IFileRepository {
  create(fileData: Partial<File>): Promise<File>;
  findById(id: string): Promise<File | null>;
} */

// src/modules/files/interfaces/storage-strategy.interface.ts
import { Express } from 'express'; // Asegúrate de tener este import

export interface IStorageStrategy {
  save(file: Express.Multer.File): Promise<string>; // Devuelve la ruta o URL
}