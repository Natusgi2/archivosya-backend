import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Get,
  Param,           // <-- 1. Importar
  Put,             // <-- 1. Importar
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // ... (endpoint 'uploadFile' existente) ...
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.filesService.handleFileUpload(file, user);
  }

  // ... (endpoint 'getMyFiles' existente) ...
  @Get('my-files')
  getMyFiles(@GetUser() user: User) {
    return this.filesService.getFilesForUser(user.id);
  }


  // --- NUEVO ENDPOINT DE MODIFICACIÓN ---
  /**
   * Reemplaza (actualiza) un archivo existente.
   * Solo el dueño o un usuario con permiso de 'edit' puede hacerlo.
   */
  @Put(':id')
  @UseInterceptors(FileInterceptor('file')) // Recibe un nuevo archivo
  updateFile(
    @Param('id') fileId: string,
    @GetUser() user: User,
    @UploadedFile() newFile: Express.Multer.File,
  ) {
    return this.filesService.updateFile(fileId, newFile, user);
  }
}

