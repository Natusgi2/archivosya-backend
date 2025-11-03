// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registra la entidad User
  providers: [UsersService],
  exports: [UsersService], // Exportamos el servicio para que Auth lo pueda usar
})
export class UsersModule {}