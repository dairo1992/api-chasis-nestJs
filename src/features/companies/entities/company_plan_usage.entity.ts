import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from './company.entity';
import { SubscriptionPlan } from '../../subscription_plans/entities/subscription_plan.entity';

@Entity({ name: 'company_plan_usage' })
@Exclude()
export class CompanyPlanUsage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @ManyToOne(() => Company, (company) => company.planUsages)
  @JoinColumn({ name: 'company_uuid', referencedColumnName: 'uuid' })
  company: Company;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.planUsages)
  @JoinColumn({ name: 'plan_uuid', referencedColumnName: 'uuid' })
  plan: SubscriptionPlan;

  @Expose()
  @Column({ name: 'current_branches_count', type: 'int', default: 0 })
  current_branches_count: number;

  @Expose()
  @Column({ name: 'current_users_count', type: 'int', default: 0 })
  current_users_count: number;

  @Expose()
  @Column({ name: 'current_roles_count', type: 'int', default: 0 })
  current_roles_count: number;

  @Expose()
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Expose()
  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date | null;

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
