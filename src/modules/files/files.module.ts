// src/modules/files/files.module.ts
import { Module, forwardRef } from '@nestjs/common'; // <-- 1. Importar forwardRef
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { PermissionsModule } from '../permissions/permissions.module'; // <-- 2. Importar PermissionsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    forwardRef(() => PermissionsModule), // <-- 3. Usar forwardRef
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: 'IStorageStrategy',
      useClass: LocalStorageStrategy,
    },
  ],
  exports: [FilesService], // Esto ya debería estar
})
export class FilesModule {}

