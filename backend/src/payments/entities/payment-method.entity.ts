import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PaymentMethodCode =
  | 'cod'
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet';

export interface PaymentMethodConfig {
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  merchantName?: string;
  webhookSecret?: string;
  sandboxMode?: boolean;
  additionalConfig?: Record<string, unknown>;
}

@Entity('payment_methods')
@Index(['code'], { unique: true })
@Index(['isActive'])
@Index(['sortOrder'])
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['cod', 'upi', 'card', 'netbanking', 'wallet'],
    unique: true,
  })
  code: PaymentMethodCode;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_test_mode', default: true })
  isTestMode: boolean;

  @Column({ type: 'jsonb', default: {} })
  config: PaymentMethodConfig;

  @Column({ name: 'supported_currencies', type: 'jsonb', default: ['INR'] })
  supportedCurrencies: string[];

  @Column({
    name: 'min_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minAmount: number | null;

  @Column({
    name: 'max_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxAmount: number | null;

  @Column({
    name: 'processing_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  processingFee: number;

  @Column({
    name: 'processing_fee_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  processingFeePercent: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
