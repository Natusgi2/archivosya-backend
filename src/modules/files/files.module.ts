import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: 'IStorageStrategy',
      useClass: LocalStorageStrategy,
    },
  ],
  // Exportamos FilesService para que otros módulos (como PermissionsModule)
  // puedan inyectarlo y usarlo.
  exports: [FilesService], // <-- ¡ESTA LÍNEA ES NUEVA!
})
export class FilesModule {}
