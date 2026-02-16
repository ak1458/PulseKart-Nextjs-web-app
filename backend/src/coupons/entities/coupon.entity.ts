import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CouponUsage } from './coupon-usage.entity';

export type CouponType = 'percentage' | 'fixed_amount';
export type ApplicableProductsType = 'all' | 'specific' | 'category';

@Entity('coupons')
export class Coupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({
        type: 'enum',
        enum: ['percentage', 'fixed_amount'],
        default: 'percentage',
    })
    type: CouponType;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column('decimal', { name: 'min_order_amount', precision: 10, scale: 2, nullable: true })
    min_order_amount: number | null;

    @Column('decimal', { name: 'max_discount_amount', precision: 10, scale: 2, nullable: true })
    max_discount_amount: number | null;

    @Column({ type: 'int', default: 0 })
    usage_limit: number;

    @Column({ type: 'int', default: 0 })
    usage_count: number;

    @Column({ type: 'int', default: 1 })
    per_user_limit: number;

    @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
    start_date: Date | null;

    @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
    end_date: Date | null;

    @Column({ default: true })
    is_active: boolean;

    @Column({
        type: 'enum',
        enum: ['all', 'specific', 'category'],
        default: 'all',
    })
    applicable_products: ApplicableProductsType;

    @Column('jsonb', { default: [] })
    applicable_product_ids: string[];

    @Column('jsonb', { default: [] })
    applicable_categories: string[];

    @Column('jsonb', { default: [] })
    excluded_products: string[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @OneToMany(() => CouponUsage, (usage) => usage.coupon)
    usages: CouponUsage[];
}
