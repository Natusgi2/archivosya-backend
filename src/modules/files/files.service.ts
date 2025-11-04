import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import type { IStorageStrategy } from './interfaces/storage-strategy.interface';
import type { Express } from 'express';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionLevel } from '../permissions/entities/permission.entity';

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

  // --- MÉTODO CORREGIDO ---
  /**
   * Busca un archivo por su ID.
   * Este método es simple y solo busca el archivo.
   */
  async findFileById(fileId: string): Promise<File | null> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });
    return file;
  }

  // --- MÉTODO NUEVO FALTANTE ---
  async updateFile(
    fileId: string,
    newFile: Express.Multer.File,
    user: User,
  ) {
    // 1. VERIFICAR PERMISO: ¿Puede este usuario EDITAR este archivo?
    // Esto llamará a la lógica que creamos en PermissionsService.
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

    // (Opcional: borrar el archivo físico viejo de /uploads)
    // await this.storageStrategy.delete(fileToUpdate.storagePath);

    // 3. Guardar el nuevo archivo físico
    const newSavedPath = await this.storageStrategy.save(newFile);

    // 4. Actualizar los metadatos en la base de datos
    fileToUpdate.originalName = newFile.originalname;
    fileToUpdate.storagePath = newSavedPath;
    fileToUpdate.mimeType = newFile.mimetype;
    fileToUpdate.size = newFile.size;
    // Nota: El ownerId no cambia

    await this.fileRepository.save(fileToUpdate);

    return {
      message: 'Archivo actualizado exitosamente',
      file: fileToUpdate,
    };
  }
}

