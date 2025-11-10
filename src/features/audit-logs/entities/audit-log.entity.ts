import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditLogStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'char', length: 36, name: 'session_id' })
  sessionId: string;

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

  @Column({ type: 'enum', enum: AuditLogStatus, nullable: true })
  status: AuditLogStatus;

  @Column({ type: 'json', nullable: true, name: 'response_data' })
  responseData: any;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
