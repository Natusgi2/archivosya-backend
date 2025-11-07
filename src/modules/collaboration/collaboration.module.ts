import { Module, forwardRef } from '@nestjs/common'; // <-- Importar forwardRef
import { CollaborationGateway } from './collaboration.gateway';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    forwardRef(() => PermissionsModule), // <-- Usar forwardRef aquí
  ],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway], // <-- Exportar el Gateway
})
export class CollaborationModule {}