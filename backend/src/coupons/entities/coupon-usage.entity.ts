import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'coupon_id' })
    coupon_id: string;

    @Column({ name: 'user_id' })
    user_id: number;

    @Column({ name: 'order_id', nullable: true })
    order_id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    discount_amount: number;

    @CreateDateColumn({ type: 'timestamptz' })
    used_at: Date;

    @ManyToOne(() => Coupon, (coupon) => coupon.usages)
    @JoinColumn({ name: 'coupon_id' })
    coupon: Coupon;
}
