// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Importante: Trae UsersService
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule, // Para poder usar el UsersService
    PassportModule,
    JwtModule.register({
      global: true, // Hacemos el módulo JWT global
      secret: 'ESTA-ES-TU-CLAVE-SECRETA-CAMBIAME', // ¡Cambia esto en producción!
      signOptions: { expiresIn: '1h' }, // El token dura 1 hora
    }),
  ],
  providers: [AuthService], // (Luego agregaremos la JwtStrategy aquí)
  controllers: [AuthController],
})
export class AuthModule {}