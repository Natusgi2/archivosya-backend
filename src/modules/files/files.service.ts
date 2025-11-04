// src/modules/files/files.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common'; // <-- Añadir NotFoundException
import type { IStorageStrategy } from './interfaces/storage-strategy.interface';
import type { Express } from 'express';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @Inject('IStorageStrategy')
    private readonly storageStrategy: IStorageStrategy,

    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async handleFileUpload(file: Express.Multer.File, user: User) {
    // 1. Guardar el archivo físico (en /uploads)
    const savedPath = await this.storageStrategy.save(file);

    // 2. Guardar los metadatos en PostgreSQL
    const newFile = this.fileRepository.create({
      originalName: file.originalname,
      storagePath: savedPath,
      mimeType: file.mimetype,
      size: file.size,
      owner: user, // <-- ¡Aquí vinculamos el archivo al usuario!
      ownerId: user.id,
    });

    await this.fileRepository.save(newFile);

    // No devuelvas el objeto 'owner' completo en la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owner, ...result } = newFile;

    return {
      message: 'Archivo subido y guardado exitosamente',
      file: result,
    };
  }

  async getFilesForUser(userId: string): Promise<File[]> {
    // Busca en la tabla 'File' todos los registros donde 'ownerId' coincida
    return this.fileRepository.find({
      where: { ownerId: userId },
      order: { originalName: 'ASC' }, // Opcional: ordenar
    });
  }

  // --- MÉTODO NUEVO REQUERIDO POR PERMISSIONS ---
  /**
   * Busca un archivo por su ID y verifica que le pertenezca al usuario.
   * Esto es crucial para la lógica de permisos.
   */
  async findFileById(fileId: string, ownerId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, ownerId: ownerId },
    });
    
    // Si no se encuentra el archivo O no le pertenece al dueño, lanza error
    if (!file) {
      throw new NotFoundException('Archivo no encontrado o no te pertenece');
    }
    return file;
  }
}
