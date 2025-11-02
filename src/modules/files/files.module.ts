// src/modules/files/files.module.ts
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    // Así le decimos a NestJS que cuando alguien pida 'IStorageStrategy',
    // debe entregar una instancia de 'LocalStorageStrategy'.
    // Esto cumple tu Patrón Strategy [cite: 146]
    {
      provide: 'IStorageStrategy', // Usamos un "token" de string
      useClass: LocalStorageStrategy,
    },
    // Aquí registrarías tu Repositorio (ej. FileRepository)
  ],
})
export class FilesModule {}