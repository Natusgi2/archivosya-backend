import { File } from '../../files/entities/file.entity';
import { Permission } from '../../permissions/entities/permission.entity'; // <-- 1. Importar
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';

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

  // Relación: Un usuario es dueño de muchos archivos
  @OneToMany(() => File, (file) => file.owner)
  files: File[];

  // --- NUEVA RELACIÓN ---
  // Relación: Un usuario tiene muchos permisos
  @OneToMany(() => Permission, (permission) => permission.user) // <-- 2. Añadir
  permissions: Permission[];
}

