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

    @Column({ name: 'user_id', nullable: true })
    userId: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Column({ name: 'product_id', nullable: true }) // Assuming productId can be null
    productId: number | null;

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

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotalAmount: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'shipping_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingAmount: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'coupon_code', type: 'varchar', nullable: true })
    couponCode: string | null;

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
