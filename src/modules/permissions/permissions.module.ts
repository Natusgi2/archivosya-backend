// src/modules/permissions/permissions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';
// --- 1. Importar CollaborationModule ---
import { CollaborationModule } from '../collaboration/collaboration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => FilesModule),
    UsersModule,
    // --- 2. Añadir CollaborationModule con forwardRef ---
    forwardRef(() => CollaborationModule),
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
