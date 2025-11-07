// archivosya-backend/src/modules/permissions/permissions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionLevel } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { File } from '../files/entities/file.entity'; // <-- Importar File

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private usersService: UsersService,

    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,

    @Inject(forwardRef(() => CollaborationGateway))
    private collaborationGateway: CollaborationGateway,
  ) {}

  /**
   * Comparte un archivo con otro usuario.
   * Solo el dueño puede llamar a esto.
   */
  async shareFile(
    fileOwner: User, // <-- CORRECCIÓN 1: Renombrado de 'owner' a 'fileOwner'
    fileId: string,
    shareWithEmail: string,
    level: PermissionLevel,
  ) {
    // 1. Verificar que el archivo existe
    const file = await this.filesService.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 2. Verificar que el usuario es el dueño
    if (file.ownerId !== fileOwner.id) { // <-- CORRECCIÓN 2: Usar 'fileOwner.id'
      throw new ForbiddenException('No tienes permiso para compartir este archivo');
    }

    // 3. Buscar al usuario con quien se quiere compartir
    const userToShareWith = await this.usersService.findByEmail(shareWithEmail);
    if (!userToShareWith) {
      throw new NotFoundException('El usuario con ese email no existe');
    }

    // 4. No se puede compartir con uno mismo
    if (userToShareWith.id === fileOwner.id) { // <-- CORRECCIÓN 3: Usar 'fileOwner.id'
      throw new ForbiddenException('No puedes compartir un archivo contigo mismo');
    }

    // 5. Crear o actualizar el permiso
    let permission = await this.permissionsRepository.findOne({
      where: { fileId: fileId, userId: userToShareWith.id },
    });

    if (permission) {
      permission.level = level;
    } else {
      permission = this.permissionsRepository.create({
        fileId: fileId,
        userId: userToShareWith.id,
        level: level,
      });
    }

    const savedPermission = await this.permissionsRepository.save(permission);

    // --- CORRECCIÓN 4: Pasar el objeto 'file' completo ---
    // Ya no hacemos la destructuración que causaba el conflicto de 'owner'
    this.collaborationGateway.sendNewShareNotification(
      userToShareWith.id,
      file, // <-- Se pasa el objeto 'file' completo
    );
    // --- Fin de la corrección ---

    return savedPermission;
  }

  /**
   * Verifica si un usuario tiene permiso para realizar una acción en un archivo.
   * Lanza un error si no tiene permiso.
   */
  async checkPermission(
    // --- CORRECCIÓN 5: Añadir los 3 argumentos que faltaban ---
    userId: string,
    fileId: string,
    requiredLevel: PermissionLevel,
  ): Promise<void> {
    // 1. Buscar el archivo
    const file = await this.filesService.findFileById(fileId); // Ahora fileId está definido
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 2. Verificar si es el dueño (el dueño puede hacer todo)
    if (file.ownerId === userId) { // Ahora userId está definido
      return; // El dueño siempre tiene permiso
    }

    // 3. Si no es el dueño, buscar un permiso en la tabla
    const permission = await this.permissionsRepository.findOne({
      where: { userId, fileId }, // Ahora userId y fileId están definidos
    });

    if (!permission) {
      throw new ForbiddenException('No tienes permiso para acceder a este archivo');
    }

    // 4. Verificar si el nivel de permiso es suficiente
    if (
      requiredLevel === PermissionLevel.VIEW &&
      (permission.level === PermissionLevel.VIEW ||
        permission.level === PermissionLevel.EDIT)
    ) {
      return; // Tiene permiso de vista
    }

    if (
      requiredLevel === PermissionLevel.EDIT &&
      permission.level === PermissionLevel.EDIT
    ) {
      return; // Tiene permiso de edición
    }

    // Si llega aquí, es que tiene un permiso (ej. 'view') pero se requiere uno superior (ej. 'edit')
    throw new ForbiddenException('Tu nivel de permiso no es suficiente');
  }

  /**
   * Obtiene todos los archivos que han sido compartidos con un usuario específico.
   */
  async getFilesSharedWithUser(userId: string) {
    // 1. Busca todos los permisos para este usuario
    const permissions = await this.permissionsRepository.find({
      where: { userId: userId },
      relations: ['file'], // <-- 2. Carga la entidad 'file' asociada
    });

    // 3. Extrae y devuelve solo los archivos (con sus datos completos)
    return permissions.map((permission) => permission.file);
  }
}