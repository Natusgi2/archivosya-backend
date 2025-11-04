// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'ESTA-ES-TU-CLAVE-SECRETA-CAMBIAME', // ¡La misma que en auth.module!
    });
  }

  /**
   * Passport llama a este método después de validar el token.
   * El 'payload' es el objeto que pusimos en el token al hacer login.
   */
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub); // payload.sub es el ID del usuario
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    // El objeto que retornamos aquí se inyectará en `req.user` en los controladores
    return user;
  }
}