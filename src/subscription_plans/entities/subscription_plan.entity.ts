import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class SubscriptionPlan {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'char', length: 36, unique: true })
    uuid: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'enum', enum: ['monthly', 'annually', 'ilimited'], default: 'monthly' })
    billing_cycle: string;

    @Column({ type: 'int', default: 1 })
    max_branches_per_company: number;

    @Column({ type: 'int', default: 1 })
    max_users_per_company: number;

    @Column({ type: 'int', default: 1 })
    max_roles_per_company: number;

    @Column({ type: 'int', default: 1 })
    max_storage_gb: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

}
