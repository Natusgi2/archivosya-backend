// src/modules/permissions/permissions.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Param,
  Get, // <-- Importado para el nuevo endpoint
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PermissionsService } from './permissions.service';
import { ShareFileDto } from './dto/share-file.dto';

@Controller('permissions')
@UseGuards(AuthGuard('jwt'))
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  /**
   * Endpoint para compartir un archivo (siendo el dueño)
   */
  @Post('share/:fileId')
  shareFile(
    @GetUser() user: User,
    @Param('fileId') fileId: string,
    @Body(ValidationPipe) shareFileDto: ShareFileDto,
  ) {
    return this.permissionsService.shareFile(
      user,
      fileId,
      shareFileDto.email,
      shareFileDto.level,
    );
  }

  /**
   * NUEVO ENDPOINT
   * Obtiene todos los archivos que otros usuarios han compartido conmigo
   */
  @Get('shared-with-me')
  getSharedWithMe(@GetUser() user: User) {
    return this.permissionsService.getFilesSharedWithUser(user.id);
  }
}