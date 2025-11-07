import { Expose } from 'class-transformer';
import { Permission } from 'src/features/permissions/entities/permission.entity';
import { Role } from 'src/features/roles/entities/role.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RolePermissions {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @ManyToOne(() => Role, (role) => role.uuid, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_uuid', referencedColumnName: 'uuid' })
  role: Role;

  @Expose()
  @ManyToOne(() => Permission, (permission) => permission.uuid, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_uuid', referencedColumnName: 'uuid' })
  permission: Permission;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;
}
