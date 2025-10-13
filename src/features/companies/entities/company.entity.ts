import { Exclude, Expose } from "class-transformer";
import { SubscriptionPlan } from "src/features/subscription_plans/entities/subscription_plan.entity";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Exclude()
export class Company {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Expose()
    @Column({ type: 'char', length: 36, unique: true })
    uuid: string;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    legal_name: string;

    @Expose()
    @Column({ type: 'int', unique: true })
    document_number: number;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    city: string;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    state: string;

    @Expose()
    @Column({ type: 'varchar', length: 255 })
    country: string;

    @Expose()
    @Column({ type: 'varchar', length: 50 })
    email: string;

    @Expose()
    @Column({ type: 'varchar', length: 50 })
    phone: string;

    @Expose()
    @Column({ type: 'varchar', length: 100 })
    Website: string;

    //usuario dueño de la compañia
    @Expose()
    @Column({ name: 'owner_user_id' })
    ownerUserId: number;

    @Expose()
    @Column({ type: 'varchar', length: 255, nullable: true })
    logo_url: string;

    @Expose()
    @OneToOne(() => SubscriptionPlan, { eager: true })
    @JoinColumn({ name: 'subscription_plan_uuid' })
    subscription_plan_uuid: string;

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