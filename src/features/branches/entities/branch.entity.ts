import { Exclude, Expose } from 'class-transformer';
import { Company } from 'src/features/companies/entities/company.entity';
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

@Entity()
@Exclude()
export class Branch {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Expose()
  @Column({ type: 'int', nullable: true })
  phone: number;

  @Expose()
  @Column({ type: 'varchar', length: 80 })
  address: string;

  @Expose()
  @Column({ type: 'int' })
  city: number;

  @Expose()
  @Column({ type: 'int' })
  state: number;

  @Expose()
  @Column({ type: 'int', nullable: true })
  manager_user_id: number;

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

  @ManyToOne(() => Company, (company) => company.branches)
  @JoinColumn({ name: 'company_uuid', referencedColumnName: 'uuid' })
  @Expose()
  company: Company;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
