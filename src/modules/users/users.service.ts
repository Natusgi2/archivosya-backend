// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos
   */
  async create(
    Nombre_Usuario: string, // <-- 1. AÑADIMOS EL NUEVO PARÁMETRO
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const newUser = this.usersRepository.create({
      Nombre_Usuario, // <-- 2. LO PASAMOS AQUÍ
      email,
      passwordHash,
    });
    return this.usersRepository.save(newUser);
  }

  /**
   * Busca un usuario por su email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  /**
   * Obtiene una lista de todos los usuarios (sin sus contraseñas)
   */
  async findAll() {
    const users = await this.usersRepository.find();
    // ¡Importante! Nunca devuelvas las contraseñas
    return users.map((user) => {
      const { passwordHash, ...result } = user;
      return result;
    });
  }
}