// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('users') // Nombre de la tabla en PostgreSQL
@Unique(['email']) // El email debe ser único
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string; // NUNCA guardes la contraseña en texto plano

  // Aquí es donde conectaremos los archivos y permisos más adelante
  // @OneToMany(() => File, (file) => file.owner)
  // files: File[];
}