// src/modules/permissions/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { File } from '../../files/entities/file.entity';

export enum PermissionLevel {
  VIEW = 'view',
  EDIT = 'edit',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionLevel,
    default: PermissionLevel.VIEW,
  })
  level: PermissionLevel;

  // --- Relaciones ---
  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => File, { eager: true })
  file: File;

  @Column()
  userId: string;

  @Column()
  fileId: string;
}