import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Get,
  Param,
  Put,
  Res, // <-- 1. Importar Response
  Delete, // <-- 2. Importar Delete
  StreamableFile, // <-- 3. Importar StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { Express, Response } from 'express'; // <-- 4. Importar Response
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.filesService.handleFileUpload(file, user);
  }

  @Get('my-files')
  getMyFiles(@GetUser() user: User) {
    return this.filesService.getFilesForUser(user.id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateFile(
    @Param('id') fileId: string,
    @GetUser() user: User,
    @UploadedFile() newFile: Express.Multer.File,
  ) {
    return this.filesService.updateFile(fileId, newFile, user);
  }

  // --- NUEVO ENDPOINT DE DESCARGA ---
  @Get(':id/download')
  async downloadFile(
    @Param('id') fileId: string,
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response, // <-- Inyectar Response
  ): Promise<StreamableFile> {
    const { fileStream, mimeType, originalName } =
      await this.filesService.downloadFile(fileId, user);

    // Configura los headers para forzar la descarga en el navegador
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return new StreamableFile(fileStream);
  }

  // --- NUEVO ENDPOINT DE ELIMINACIÓN ---
  @Delete(':id')
  deleteFile(@Param('id') fileId: string, @GetUser() user: User) {
    return this.filesService.deleteFile(fileId, user);
  }
}

  