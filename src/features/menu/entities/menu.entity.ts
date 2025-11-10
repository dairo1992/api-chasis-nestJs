import { Expose } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('menus')
export class Menus {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // AGREGADO: 'users', 'companies', etc.

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Expose()
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  route: string;

  @Expose()
  @Column({ type: 'int', default: 0 })
  order: number;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Expose()
  @ManyToOne(() => Menus, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_uuid', referencedColumnName: 'uuid' })
  parent: Menus;

  @OneToMany(() => Menus, (menu) => menu.parent)
  children: Menus[];

  @OneToMany(() => Permission, (permission) => permission.menu)
  permissions: Permission[];

  @Expose()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
