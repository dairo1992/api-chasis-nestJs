import { Company } from 'src/features/companies/entities/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  API_KEY = 'api_key',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity({ name: 'user_tokens' })
export class UserToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @Column({
    name: 'company_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  companyId: number | null;

  @ManyToOne(() => Company, (company) => company.uuid)
  @JoinColumn({ name: 'company_uuid' })
  company: Company;

  @Column({
    name: 'token_type',
    type: 'enum',
    enum: TokenType,
  })
  tokenType: TokenType;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'json', nullable: true })
  scopes: JSON | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
