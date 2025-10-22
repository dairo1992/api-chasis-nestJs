import { Expose } from 'class-transformer';
import { Menus } from 'src/features/menu/entities/menu.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Expose()
  @Column({ type: 'varchar', length: 50, unique: true })
  resource: string;

  @Expose()
  @Column({ type: 'varchar', length: 50, unique: true })
  action: string;

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

  @Expose()
  @OneToOne(() => Menus, { eager: true })
  @JoinColumn({ name: 'menu_uuid' })
  subscription_plan_id: number;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
