import { Exclude, Expose } from 'class-transformer';
import { Company } from 'src/features/companies/entities/company.entity';
import { Role } from 'src/features/roles/entities/role.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { UserSession } from './user-session.entity';
import { UserToken } from './user-token.entity';

@Entity({ name: 'users' })
@Exclude()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Expose()
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Expose()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Expose()
  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.uuid)
  @JoinColumn({ name: 'company_uuid' })
  company: Company;

  @Expose()
  @Column({ name: 'role_id', type: 'bigint', unsigned: true })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.uuid)
  @JoinColumn({ name: 'role_uuid' })
  role: Role;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt: Date;

  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
