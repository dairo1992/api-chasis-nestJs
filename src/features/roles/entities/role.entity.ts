import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../../companies/entities/company.entity';

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

  @Expose()
  @Column({
    name: 'company_uuid',
    type: 'char',
    length: 36,
    unsigned: true,
    nullable: true,
  })
  company_uuid: string | null;

  @ManyToOne(() => Company, (company) => company.roles)
  @JoinColumn({ name: 'company_uuid' })
  company: Company;

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

  // @Expose()
  // @OneToOne(() => Menus, { eager: true })
  // @JoinColumn({ name: 'menu_uuid' })
  // subscription_plan_id: number;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
