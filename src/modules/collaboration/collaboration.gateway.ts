// archivosya-backend/src/modules/collaboration/collaboration.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionLevel } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { File } from '../files/entities/file.entity';
// --- 1. Importar Inject y forwardRef ---
import { Inject, forwardRef } from '@nestjs/common';

// Define un tipo para el Socket que incluye al usuario
interface AuthenticatedSocket extends Socket {
  user: User;
}

@WebSocketGateway({ cors: true })
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // --- 2. CORRECCIÓN DEL ERROR ---
  // Inyectar PermissionsService usando forwardRef para romper la dependencia circular
  constructor(
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    // El 'client.user' fue adjuntado por nuestro WsAuthAdapter
    console.log(`Cliente conectado: ${client.user.email} (ID: ${client.id})`);

    // Unir al usuario a una sala privada con su propio ID.
    client.join(client.user.id);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(
      `Cliente desconectado: ${client.user?.email || 'desconocido'} (ID: ${client.id})`,
    );
  }

  @SubscribeMessage('joinFileRoom')
  async handleJoinRoom(
    @MessageBody() fileId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // VERIFICAR PERMISO: ¿Puede el usuario VER este archivo?
      await this.permissionsService.checkPermission(
        client.user.id,
        fileId,
        PermissionLevel.VIEW,
      );

      // Si tiene permiso, lo une a la sala
      client.join(fileId);
      console.log(
        `Usuario ${client.user.email} se unió a la sala del archivo ${fileId}`,
      );
      client.emit('joinedRoom', fileId); // Notifica al cliente que se unió
    } catch (error) {
      console.error(`Error al unirse a la sala: ${error.message}`);
      client.emit('error', 'No tienes permiso para ver este archivo');
    }
  }

  @SubscribeMessage('editFile')
  async handleEditFile(
    @MessageBody() payload: { fileId: string; content: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // VERIFICAR PERMISO: ¿Puede el usuario EDITAR este archivo?
      await this.permissionsService.checkPermission(
        client.user.id,
        payload.fileId,
        PermissionLevel.EDIT,
      );

      // Si tiene permiso, retransmite la edición a TODOS los demás en la sala
      client.broadcast
        .to(payload.fileId)
        .emit('fileUpdated', payload.content);
    } catch (error) {
      console.error(`Error al editar: ${error.message}`);
      client.emit('error', 'No tienes permiso para editar este archivo');
    }
  }

  /**
   * Notifica a un usuario específico que se le ha compartido un archivo.
   * Esto es llamado por el PermissionsService.
   */
  sendNewShareNotification(userId: string, file: File) {
    console.log(`Enviando notificación 'newFileShared' al usuario ${userId}`);
    this.server.to(userId).emit('newFileShared', file);
  }
}