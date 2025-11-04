// src/modules/files/files.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Get, // <-- AÑADIMOS 'Get' A LA IMPORTACIÓN
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('files')
@UseGuards(AuthGuard('jwt')) // <-- Protegemos todas las rutas de este controlador
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User, // <-- Obtenemos el usuario logueado
  ) {
    // Pasamos el archivo Y el usuario al servicio
    return this.filesService.handleFileUpload(file, user);
  }

  // --- ENDPOINT 'GET MY FILES' ---
  @Get('my-files')
  getMyFiles(@GetUser() user: User) {
    return this.filesService.getFilesForUser(user.id);
  }
}
