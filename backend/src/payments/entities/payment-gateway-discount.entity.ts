import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import type { PaymentMethodCode } from './payment-method.entity';

export type DiscountType = 'percentage' | 'fixed';

@Entity('payment_gateway_discounts')
@Index(['paymentMethodCode'])
@Index(['isActive'])
@Index(['startDate', 'endDate'])
export class PaymentGatewayDiscount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'payment_method_code' })
    paymentMethodCode: PaymentMethodCode;

    @Column({
        name: 'discount_type',
        type: 'enum',
        enum: ['percentage', 'fixed'],
        default: 'percentage',
    })
    discountType: DiscountType;

    @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxDiscountAmount: number | null;

    @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    minOrderAmount: number | null;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
    startDate: Date | null;

    @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
    endDate: Date | null;

    @Column({ name: 'usage_limit', type: 'int', default: 0 })
    usageLimit: number;

    @Column({ name: 'usage_count', type: 'int', default: 0 })
    usageCount: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    /**
     * Check if the discount is currently valid based on date range
     */
    isValidDate(): boolean {
        const now = new Date();
        
        if (this.startDate && now < this.startDate) {
            return false;
        }
        
        if (this.endDate && now > this.endDate) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if the discount has remaining usage capacity
     */
    hasRemainingUsage(): boolean {
        if (this.usageLimit === 0) {
            return true; // 0 means unlimited
        }
        return this.usageCount < this.usageLimit;
    }

    /**
     * Check if the discount is applicable for a given order amount
     */
    isApplicableForAmount(orderAmount: number): boolean {
        if (this.minOrderAmount && orderAmount < this.minOrderAmount) {
            return false;
        }
        return true;
    }

    /**
     * Calculate the discount amount for a given order amount
     */
    calculateDiscount(orderAmount: number): number {
        if (!this.isApplicableForAmount(orderAmount)) {
            return 0;
        }

        let discountAmount: number;

        if (this.discountType === 'percentage') {
            discountAmount = (orderAmount * this.discountValue) / 100;
            
            // Apply max discount cap if set
            if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
                discountAmount = this.maxDiscountAmount;
            }
        } else {
            // Fixed amount discount
            discountAmount = this.discountValue;
            
            // Fixed discount cannot exceed order amount
            if (discountAmount > orderAmount) {
                discountAmount = orderAmount;
            }
        }

        return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
    }
}
