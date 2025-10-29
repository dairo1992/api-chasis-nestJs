import { Exclude, Expose } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  DeleteDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CompanyPlanUsage } from '../../companies/entities/company_plan_usage.entity';

@Entity()
@Exclude()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: ['monthly', 'annually', 'ilimited'],
    default: 'monthly',
  })
  billing_cycle: string;

  @Expose()
  @Column({ type: 'int', default: 1 })
  max_branches_per_company: number;

  @Expose()
  @Column({ type: 'int', default: 1 })
  max_users_per_company: number;

  @Expose()
  @Column({ type: 'int', default: 1 })
  max_roles_per_company: number;

  @Expose()
  @Column({ type: 'int', default: 1 })
  max_storage_gb: number;

  @Expose()
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;

  @OneToMany(() => CompanyPlanUsage, (planUsage) => planUsage.plan)
  planUsages: CompanyPlanUsage[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
