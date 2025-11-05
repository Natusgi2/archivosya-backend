// src/modules/files/files.service.ts
import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IStorageStrategy } from './interfaces/storage-strategy.interface';
import type { Express } from 'express';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionLevel } from '../permissions/entities/permission.entity';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @Inject('IStorageStrategy')
    private readonly storageStrategy: IStorageStrategy,

    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,

    // Inyecta PermissionsService usando forwardRef
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
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
      owner: user,
      ownerId: user.id,
    });

    await this.fileRepository.save(newFile);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owner, ...result } = newFile;

    return {
      message: 'Archivo subido y guardado exitosamente',
      file: result,
    };
  }

  // --- CORRECCIÓN DE ERROR (Faltaba 'return') ---
  async getFilesForUser(userId: string): Promise<File[]> {
    // Busca en la tabla 'File' todos los registros donde 'ownerId' coincida
    return this.fileRepository.find({
      where: { ownerId: userId },
      order: { originalName: 'ASC' },
    });
  }

  /**
   * Busca un archivo por su ID.
   */
  async findFileById(fileId: string): Promise<File | null> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });
    return file;
  }

  async updateFile(
    fileId: string,
    newFile: Express.Multer.File,
    user: User,
  ) {
    // 1. VERIFICAR PERMISO: ¿Puede este usuario EDITAR este archivo?
    await this.permissionsService.checkPermission(
      user.id,
      fileId,
      PermissionLevel.EDIT,
    );

    // 2. Si pasa la verificación, buscar los metadatos del archivo viejo
    const fileToUpdate = await this.fileRepository.findOneBy({ id: fileId });
    if (!fileToUpdate) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 3. Guardar el nuevo archivo físico
    const newSavedPath = await this.storageStrategy.save(newFile);

    // 4. Actualizar los metadatos en la base de datos
    fileToUpdate.originalName = newFile.originalname;
    fileToUpdate.storagePath = newSavedPath;
    fileToUpdate.mimeType = newFile.mimetype;
    fileToUpdate.size = newFile.size;

    await this.fileRepository.save(fileToUpdate);

    return {
      message: 'Archivo actualizado exitosamente',
      file: fileToUpdate,
    };
  }

  async downloadFile(fileId: string, user: User) {
    // 1. Verificar permiso de VISTA
    await this.permissionsService.checkPermission(
      user.id,
      fileId,
      PermissionLevel.VIEW, // Solo necesita permiso de VISTA para descargar
    );

    // 2. Obtener metadatos del archivo
    const file = await this.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 3. Crear un stream de lectura desde la carpeta /uploads
    const filePath = join(process.cwd(), 'uploads', file.storagePath);
    const fileStream = createReadStream(filePath);

    return {
      fileStream,
      mimeType: file.mimeType,
      originalName: file.originalName,
    };
  }

  async deleteFile(fileId: string, user: User) {
    // 1. Buscar el archivo
    const file = await this.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 2. Verificar que es el DUEÑO (solo el dueño puede borrar)
    if (file.ownerId !== user.id) {
      throw new ForbiddenException('Solo el dueño puede eliminar este archivo');
    }

    // (Opcional: borrar el archivo físico de /uploads)

    // 4. Borrar de la base de datos
    await this.fileRepository.delete(fileId);

    return { message: 'Archivo eliminado exitosamente' };
  }
}