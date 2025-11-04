// src/modules/users/entities/user.entity.ts
import { File } from '../../files/entities/file.entity'; // <-- 1. Importar
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm'; // <-- 2. Importar OneToMany

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Usuario: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 70 })
  passwordHash: string;

  // --- Relación Clave ---
  // UN usuario puede tener MUCHOS archivos
  @OneToMany(() => File, (file) => file.owner) // <-- 3. Añadir esta relación
  files: File[];
}