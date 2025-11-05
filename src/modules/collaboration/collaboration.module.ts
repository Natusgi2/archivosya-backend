import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { PermissionsModule } from '../permissions/permissions.module'; // <-- 1. Importar

@Module({
  imports: [PermissionsModule], // <-- 2. Añadir a imports
  providers: [CollaborationGateway],
})
export class CollaborationModule {}