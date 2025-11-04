import { Expose } from 'class-transformer';
import { Company } from 'src/features/companies/entities/company.entity';
import { Role } from 'src/features/roles/entities/role.entity';
import {
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'persons' })
export class Person {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  document_type: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  document_number: string;

  @Expose()
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  first_name: string;

  @Expose()
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  last_name: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  phone: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @ManyToOne(() => Company, (company) => company.uuid)
  @JoinColumn({ name: 'company_uuid' })
  company: Company;

  @ManyToOne(() => Role, (role) => role.uuid)
  @JoinColumn({ name: 'role_uuid' })
  role: Role;

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
