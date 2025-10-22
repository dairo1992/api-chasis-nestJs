import { Expose } from 'class-transformer';
import { Menus } from 'src/features/menu/entities/menu.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_system_role: boolean;

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
