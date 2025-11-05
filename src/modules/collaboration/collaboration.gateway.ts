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

// Define un tipo para el Socket que incluye al usuario
interface AuthenticatedSocket extends Socket {
  user: User; // El adaptador WsAuthAdapter adjuntará el usuario aquí
}

@WebSocketGateway({ cors: true })
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private permissionsService: PermissionsService) {}

  async handleConnection(client: AuthenticatedSocket) {
    // El 'client.user' fue adjuntado por nuestro WsAuthAdapter
    console.log(`Cliente conectado: ${client.user.email} (ID: ${client.id})`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(
      `Cliente desconectado: ${client.user?.email || 'desconocido'} (ID: ${client.id})`,
    );
  }

  /**
   * Un usuario se une a una "sala" para un archivo específico
   */
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
      // Si no tiene permiso, le envía un error
      console.error(`Error al unirse a la sala: ${error.message}`);
      client.emit('error', 'No tienes permiso para ver este archivo');
    }
  }

  /**
   * Un usuario envía una edición
   */
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

      // --- CORRECCIÓN DE SINTAXIS ---
      // Si tiene permiso, retransmite la edición a TODOS los demás en la sala
      client.broadcast
        .to(payload.fileId)
        .emit('fileUpdated', payload.content);
    } catch (error) {
      console.error(`Error al editar: ${error.message}`);
      client.emit('error', 'No tienes permiso para editar este archivo');
    }
  }
}