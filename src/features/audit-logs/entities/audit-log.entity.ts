import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'user_id' })
  userId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: 'company_id',
  })
  companyId: number;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'resource_type',
  })
  resourceType: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'endpoint',
  })
  endpoint: string;

  @Column({ type: 'json', nullable: true, name: 'old_values' })
  oldValues: any;

  @Column({ type: 'json', nullable: true, name: 'new_values' })
  newValues: any;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
