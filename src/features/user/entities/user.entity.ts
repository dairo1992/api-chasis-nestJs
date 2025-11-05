import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { UserSession } from './user-session.entity';
import { UserToken } from './user-token.entity';
import { Person } from 'src/features/persons/entities/person.entity';

@Entity({ name: 'users' })
@Exclude()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Expose()
  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, unique: true })
  user: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Expose()
  @OneToOne(() => Person, (person) => person.uuid, { eager: true })
  @JoinColumn({ name: 'person_uuid', referencedColumnName: 'uuid' })
  person: Person;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Expose()
  @Column({ name: 'incorrect_login', type: 'int', nullable: true })
  incorrectLoginAttempts: number | null;

  @Column({ name: 'required_password_change', type: 'boolean', default: true })
  firstPasswordChange: boolean;

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
