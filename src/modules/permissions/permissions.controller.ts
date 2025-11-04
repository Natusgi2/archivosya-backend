// src/modules/permissions/permissions.controller.ts
import { Controller, Post, Body, UseGuards, ValidationPipe, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PermissionsService } from './permissions.service';
import { ShareFileDto } from './dto/share-file.dto'; // (Crea este DTO)

@Controller('permissions')
@UseGuards(AuthGuard('jwt'))
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

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
}