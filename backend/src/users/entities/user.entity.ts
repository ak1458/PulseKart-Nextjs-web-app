import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type UserRole = 'admin' | 'customer';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ name: 'password_hash', length: 255, select: false })
    password: string;

    @Column({ length: 255 })
    name: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'customer',
    })
    role: UserRole;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
