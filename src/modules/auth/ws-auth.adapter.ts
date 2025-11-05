import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

/**
 * Este adaptador intercepta todas las conexiones WebSocket entrantes
 * y utiliza el JwtService para autenticar al usuario.
 */
export class WsAuthAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplicationContext,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, options);

    // Middleware de Socket.IO para autenticar CADA conexión
    server.use(async (socket: Socket, next) => {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers['authorization'];

      if (!token) {
        return next(new Error('Token de autenticación no proporcionado'));
      }

      try {
        const payload = this.jwtService.verify(token, {
          secret: 'ESTA-ES-TU-CLAVE-SECRETA-CAMBIAME', // ¡Usa tu clave secreta!
        });

        const user = await this.usersService.findById(payload.sub);
        if (!user) {
          return next(new Error('Usuario no encontrado'));
        }

        // ¡Éxito! Adjuntamos el usuario al objeto socket
        (socket as any).user = user;
        next();
      } catch (err) {
        next(new Error('Token inválido o expirado'));
      }
    });

    return server;
  }
}