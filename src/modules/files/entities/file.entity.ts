// src/modules/files/entities/file.entity.ts
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string; // El nombre original del archivo, ej: "tarea.pdf"

  @Column()
  storagePath: string; // El nombre único en disco, ej: "uuid-aleatorio.pdf"

  @Column()
  mimeType: string; // ej: "application/pdf"

  @Column('bigint')
  size: number; // Tamaño en bytes

  // --- Relación Clave ---
  // Varios archivos pueden pertenecer a UN usuario
  @ManyToOne(() => User, (user) => user.files, { eager: false })
  owner: User;
  
  @Column()
  ownerId: string; // Guardamos el ID del dueño para facilitar consultas
}