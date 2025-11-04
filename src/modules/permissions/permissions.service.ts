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

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private usersService: UsersService,

    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
  ) {}

  /**
   * Comparte un archivo con otro usuario.
   * Solo el dueño puede llamar a esto.
   */
  async shareFile(
    owner: User,
    fileId: string,
    shareWithEmail: string,
    level: PermissionLevel,
  ) {
    // 1. Verificar que el archivo existe
    // (Ahora esta llamada es correcta, buscará el método con 1 argumento)
    const file = await this.filesService.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 2. Verificar que el usuario es el dueño
    if (file.ownerId !== owner.id) {
      throw new ForbiddenException('No tienes permiso para compartir este archivo');
    }

    // 3. Buscar al usuario con quien se quiere compartir
    const userToShareWith = await this.usersService.findByEmail(shareWithEmail);
    if (!userToShareWith) {
      throw new NotFoundException('El usuario con ese email no existe');
    }

    // 4. No se puede compartir con uno mismo
    if (userToShareWith.id === owner.id) {
      throw new ForbiddenException('No puedes compartir un archivo contigo mismo');
    }

    // 5. Crear o actualizar el permiso
    let permission = await this.permissionsRepository.findOne({
      where: { fileId: fileId, userId: userToShareWith.id },
    });

    if (permission) {
      // Si ya existe, actualiza el nivel
      permission.level = level;
    } else {
      // --- LÓGICA SIMPLIFICADA ---
      // Si no, crea uno nuevo usando solo IDs.
      // Esto es más seguro y evita problemas de cascada.
      permission = this.permissionsRepository.create({
        fileId: fileId,
        userId: userToShareWith.id,
        level: level,
      });
    }

    return this.permissionsRepository.save(permission);
  }

  /**
   * Verifica si un usuario tiene permiso para realizar una acción en un archivo.
   * Lanza un error si no tiene permiso.
   */
  async checkPermission(
    userId: string,
    fileId: string,
    requiredLevel: PermissionLevel,
  ): Promise<void> {
    // 1. Buscar el archivo
    // (Esta llamada también es correcta ahora)
    const file = await this.filesService.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // 2. Verificar si es el dueño (el dueño puede hacer todo)
    if (file.ownerId === userId) {
      return; // El dueño siempre tiene permiso
    }

    // 3. Si no es el dueño, buscar un permiso en la tabla
    const permission = await this.permissionsRepository.findOne({
      where: { userId, fileId },
    });

    if (!permission) {
      throw new ForbiddenException('No tienes permiso para acceder a este archivo');
    }

    // 4. Verificar si el nivel de permiso es suficiente
    // Si se requiere 'view', 'edit' también sirve.
    // Si se requiere 'edit', solo 'edit' sirve.
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
}


