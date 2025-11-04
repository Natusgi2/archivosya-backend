// src/modules/permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    FilesModule, // Importa para usar FileRepository
    UsersModule, // Importa para usar UsersService
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
