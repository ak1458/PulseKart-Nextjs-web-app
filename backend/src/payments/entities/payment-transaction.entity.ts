import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import type { PaymentMethodCode } from './payment-method.entity';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentMetadata {
    orderItems?: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: Record<string, unknown>;
    billingAddress?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface GatewayResponse {
    transactionId?: string;
    status?: string;
    message?: string;
    rawResponse?: Record<string, unknown>;
    [key: string]: unknown;
}

@Entity('payment_transactions')
@Index(['orderId'])
@Index(['userId'])
@Index(['paymentMethodCode'])
@Index(['status'])
@Index(['gatewayTransactionId'])
@Index(['createdAt'])
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id', length: 100 })
    orderId: string;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'payment_method_code' })
    paymentMethodCode: PaymentMethodCode;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 3, default: 'INR' })
    currency: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
    })
    status: PaymentStatus;

    @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 255, nullable: true })
    gatewayTransactionId: string | null;

    @Column({ type: 'jsonb', default: {} })
    metadata: PaymentMetadata;

    @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
    gatewayResponse: GatewayResponse | null;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage: string | null;

    @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
    processedAt: Date | null;

    @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
    refundedAt: Date | null;

    @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    refundAmount: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    /**
     * Check if the payment can be refunded
     */
    canBeRefunded(): boolean {
        return this.status === 'completed' && 
               (this.refundAmount === null || this.refundAmount === undefined || this.refundAmount < this.amount);
    }

    /**
     * Get the remaining amount that can be refunded
     */
    getRefundableAmount(): number {
        if (this.status !== 'completed') {
            return 0;
        }
        const alreadyRefunded = this.refundAmount || 0;
        return Math.round((this.amount - alreadyRefunded) * 100) / 100;
    }

    /**
     * Update status and set processed timestamp if completed
     */
    updateStatus(status: PaymentStatus, errorMessage?: string): void {
        this.status = status;
        
        if (status === 'completed') {
            this.processedAt = new Date();
        }
        
        if (errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
}
