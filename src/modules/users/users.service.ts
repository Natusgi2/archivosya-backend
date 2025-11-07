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

  
  async create( // se crea la base de datos del usuario
    Nombre_Usuario: string, 
    email: string,
    passwordHash: string,
  ): Promise<User> { // se define el tipo de dato que retorna la funcion
    const newUser = this.usersRepository.create({ // se crea el nuevo usuario como objeto
      Nombre_Usuario, 
      email,
      passwordHash,
    });
    return this.usersRepository.save(newUser);// se guarda el nuevo usuario en la base de datos
  }

  // Busca un usuario por su email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  // Busca un usuario por su ID
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  //Obtiene una lista de todos los usuarios (sin sus contraseñas)
  async findAll() {
    const users = await this.usersRepository.find(); // obtiene todoss los usuarios
    // ¡Importante! Nunca devuelvas las contraseñas
    return users.map((user) => { 
      const { passwordHash, ...result } = user; // no incluye la contraseña en el resultado final.
      return result; 
    });
  }
}