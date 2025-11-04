// src/modules/users/users.controller.ts
import { Controller, Get, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // Proteger todos los endpoints de usuarios
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene una lista de todos los usuarios (sin sus contraseñas)
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id); // findById ya existe en tu servicio

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // IMPORTANTE: Quitamos el hash de la contraseña antes de devolverlo
    const { passwordHash, ...result } = user;
    return result;
  }
}