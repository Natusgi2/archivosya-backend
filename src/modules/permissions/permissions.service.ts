// src/modules/permissions/permissions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionLevel } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service'; // Necesitaremos esto

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private usersService: UsersService,
    private filesService: FilesService, // Lo inyectamos (requiere exportar FilesService desde FilesModule)
  ) {}

  async shareFile(
    owner: User,
    fileId: string,
    shareWithEmail: string,
    level: PermissionLevel,
  ) {
    // 1. Verificar que el archivo existe y que el usuario es el dueño
    const file = await this.filesService.findFileById(fileId, owner.id);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    if (file.ownerId !== owner.id) {
      throw new ForbiddenException('No tienes permiso para compartir este archivo');
    }

    // 2. Buscar al usuario con quien se quiere compartir
    const userToShareWith = await this.usersService.findByEmail(shareWithEmail);
    if (!userToShareWith) {
      throw new NotFoundException('El usuario con ese email no existe');
    }
    if (userToShareWith.id === owner.id) {
      throw new ForbiddenException('No puedes compartir un archivo contigo mismo');
    }

    // 3. Crear o actualizar el permiso
    let permission = await this.permissionsRepository.findOne({
      where: { fileId: fileId, userId: userToShareWith.id },
    });

    if (permission) {
      // Si ya existe, actualiza el nivel
      permission.level = level;
    } else {
      // Si no, crea uno nuevo
      permission = this.permissionsRepository.create({
        fileId: fileId,
        userId: userToShareWith.id,
        level: level,
      });
    }

    return this.permissionsRepository.save(permission);
  }
}