import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { moneyTransformer } from '../../common/transformers/decimal.transformer';

export enum OrderStatus {
    CREATED = 'created',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Integer, not string: users.id is a SERIAL primary key. The migration
    // declared this column UUID, which made its foreign key to users(id)
    // impossible to create.
    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Column({ name: 'guest_email', type: 'varchar', nullable: true })
    guestEmail: string | null;

    @Column({ name: 'guest_name', type: 'varchar', nullable: true })
    guestName: string | null;

    @Column({ name: 'customer_name', type: 'varchar', nullable: true })
    customerName: string | null;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.CREATED,
    })
    status: OrderStatus;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
    totalAmount: number;

    @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2, default: 0, transformer: moneyTransformer })
    subtotalAmount: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0, transformer: moneyTransformer })
    taxAmount: number;

    @Column({ name: 'shipping_amount', type: 'decimal', precision: 10, scale: 2, default: 0, transformer: moneyTransformer })
    shippingAmount: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0, transformer: moneyTransformer })
    discountAmount: number;

    @Column({ name: 'coupon_code', type: 'varchar', nullable: true })
    couponCode: string | null;

    /** The prescription this order was dispensed against, when required. */
    @Column({ name: 'prescription_id', type: 'uuid', nullable: true })
    prescriptionId: string | null;

    @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
    shippingAddress: Record<string, any> | null;

    @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
    billingAddress: Record<string, any> | null;

    @Column({ name: 'payment_method', type: 'varchar', nullable: true })
    paymentMethod: string | null;

    @Column({ name: 'transaction_id', type: 'varchar', nullable: true })
    transactionId: string | null;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'items_count', type: 'int', default: 0 })
    itemsCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
    shippedAt: Date | null;

    @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
    deliveredAt: Date | null;
}
