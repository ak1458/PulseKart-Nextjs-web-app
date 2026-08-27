import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AddressLabel {
    HOME = 'home',
    WORK = 'work',
    OTHER = 'other',
}

/**
 * A saved delivery address.
 *
 * Orders keep their own JSONB copy of the address they shipped to, so editing
 * or deleting a row here never rewrites where a past order actually went.
 */
@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: AddressLabel, default: AddressLabel.HOME })
    label: AddressLabel;

    @Column({ name: 'recipient_name', type: 'varchar', length: 120 })
    recipientName: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 255 })
    line1: string;

    @Column({ type: 'varchar', length: 80 })
    city: string;

    @Column({ type: 'varchar', length: 6 })
    pincode: string;

    /**
     * Uniqueness is enforced by a partial unique index rather than by trusting
     * the service to clear the previous default every time.
     */
    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
