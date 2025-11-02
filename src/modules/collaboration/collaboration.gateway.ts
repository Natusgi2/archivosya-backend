// src/modules/collaboration/collaboration.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true }) // Habilitamos CORS para el frontend
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server; // Esta es la instancia del servidor de Socket.IO

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id);
  }

  // Este es el evento que el frontend enviará cuando un usuario edite
  @SubscribeMessage('editFile')
  handleEditFile(client: Socket, payload: { fileId: string; content: string }): void {
    
    console.log('Edición recibida:', payload);

    // Esto es un 'broadcast' (notificación)
    // Se lo enviamos a TODOS los demás clientes (menos al que lo envió)
    // Esto cumple con las "Notificaciones en tiempo real" [cite: 23]
    client.broadcast.emit('fileUpdated', payload);
  }

  // (Paso avanzado): Deberías usar "rooms" para notificar solo
  // a los usuarios que están viendo el *mismo* archivo.
  @SubscribeMessage('joinFileRoom')
  handleJoinRoom(client: Socket, fileId: string): void {
    client.join(fileId); // El cliente se une a una "sala" con el ID del archivo
  }
}