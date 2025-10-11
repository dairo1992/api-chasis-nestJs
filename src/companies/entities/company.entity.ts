import { BeforeInsert, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class Company {
    // @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    // id: number;

    // @Column({ type: 'char', length: 36, unique: true })
    // uuid: string;

    // @Column({ type: 'varchar', length: 255 })
    // name: string;

    // @Column({ type: 'varchar', length: 255 })
    // legal_name: string;

    // @Column({ type: 'int', length: 10 })
    // document_number: number;

    // @Column({ type: 'varchar', length: 255 })
    // address: string;

    // @Column({ type: 'varchar', length: 255 })
    // city: string;

    // @Column({ type: 'varchar', length: 255 })
    // state: string;

    // @Column({ type: 'varchar', length: 255 })
    // country: string;

    // @Column({ type: 'varchar', length: 50 })
    // email: string;

    // @Column({ type: 'varchar', length: 50 })
    // phone: string;

    // @Column({ type: 'varchar', length: 100 })
    // Website: string;

    // //usuario dueño de la compañia
    // @Column({ name: 'owner_user_id' })
    // ownerUserId: number;

    // @Column({ type: 'varchar', length: 255, nullable: true })
    // logo_url: string;

    // @Column()
    // subscription_plan_id: number;


    // @Column({ name: 'is_active', type: 'boolean', default: true })
    // isActive: boolean;

    // @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    // createdAt: Date;

    // @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    // updatedAt: Date;

    // @BeforeInsert()
    // generateUuid() {
    //     if (!this.uuid) {
    //         this.uuid = uuidv4();
    //     }
    // }
}


//address, city, state, country, postal_code