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
  async create(email: string, passwordHash: string): Promise<User> {
    const newUser = this.usersRepository.create({ email, passwordHash });
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
}