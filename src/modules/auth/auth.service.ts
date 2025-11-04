// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(Nombre_Usuario: string, email: string, pass: string): Promise<{ access_token: string }> {
    // 1. Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(pass, saltRounds);

    // 3. Crear el usuario
    const user = await this.usersService.create(Nombre_Usuario, email, passwordHash);

    // 4. Generar y devolver el token JWT
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, pass: string): Promise<{ access_token: string }> {
    // 1. Buscar al usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generar y devolver el token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}