import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { PermissionLevel } from '../entities/permission.entity';

export class ShareFileDto {
  /**
   * El email del usuario con quien se quiere compartir el archivo.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * El nivel de permiso a otorgar.
   * Debe ser 'view' o 'edit'.
   */
  @IsEnum(PermissionLevel, {
    message: `El nivel de permiso debe ser '${PermissionLevel.VIEW}' o '${PermissionLevel.EDIT}'`,
  })
  @IsNotEmpty()
  level: PermissionLevel;
}