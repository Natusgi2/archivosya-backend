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
  @PrimaryGeneratedColumn('uuid') // Genera un ID único para cada usuario
  id: string;

  @Column({ type: 'varchar', length: 50 }) //genera el nombre del usuario, con un tipo varchar, que no puede ser mayor a 50.
  Nombre_Usuario: string;

  @Column({ type: 'varchar', length: 150 }) // genera el email del usuario, con un tipo varchar, que no puede ser mayor a 150.
  email: string;

  @Column({ type: 'varchar', length: 70 }) // genera la contraseña del usuario, con un tipo varchar, que no puede ser mayor a 70, no se uso 50 debido,
  // a que el hash de las contraseñas tiene un tamaño de 60 caracteres.
  passwordHash: string;

  // Relación: Un usuario es dueño de muchos archivos
  @OneToMany(() => File, (file) => file.owner)
  files: File[];

  // --- NUEVA RELACIÓN ---
  // Relación: Un usuario puede tener muchos permisos sobre muchos archivos
  @OneToMany(() => Permission, (permission) => permission.user) // <-- 2. Añadir
  permissions: Permission[];
}

