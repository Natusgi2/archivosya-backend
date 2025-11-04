// src/modules/permissions/permissions.module.ts
import { Module, forwardRef } from '@nestjs/common'; // <-- 1. Importar forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { FilesModule } from '../files/files.module'; // <-- 2. Importar FilesModule
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => FilesModule), // <-- 3. Usar forwardRef
    UsersModule,
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService], // <-- 4. Exportar el servicio
})
export class PermissionsModule {}
