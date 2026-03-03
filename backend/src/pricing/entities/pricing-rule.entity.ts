import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PricingRuleType =
  | 'percentage_discount'
  | 'fixed_discount'
  | 'buy_x_get_y'
  | 'bulk_price'
  | 'tiered_pricing';

export interface PricingRuleConditions {
  /** Minimum quantity required to apply the rule */
  minQuantity?: number;
  /** Maximum quantity allowed for the rule */
  maxQuantity?: number;
  /** Minimum order value required */
  minOrderValue?: number;
  /** Maximum order value allowed */
  maxOrderValue?: number;
  /** Specific product IDs this rule applies to */
  productIds?: number[];
  /** Specific category IDs this rule applies to */
  categoryIds?: string[];
  /** User tags required (e.g., 'vip', 'new', 'loyal') */
  userTags?: string[];
  /** Time of day in "HH:MM-HH:MM" format (e.g., "14:00-16:00") */
  timeOfDay?: string;
  /** Days of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek?: number[];
}

export interface TieredPricingTier {
  /** Minimum quantity for this tier */
  minQty: number;
  /** Price per unit at this tier */
  price: number;
}

export interface PricingRuleActions {
  /** Percentage discount (0-100) */
  discountPercent?: number;
  /** Fixed discount amount */
  discountAmount?: number;
  /** Quantity to buy for BOGO */
  buyQuantity?: number;
  /** Quantity to get free for BOGO */
  getQuantity?: number;
  /** Product ID to get free (if different from bought product) */
  getProductId?: number;
  /** Fixed price per unit for bulk pricing */
  bulkPrice?: number;
  /** Tiers for tiered pricing */
  tiers?: TieredPricingTier[];
}

@Entity('pricing_rules')
@Index(['isActive', 'startDate', 'endDate'])
@Index(['priority'])
export class PricingRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: [
      'percentage_discount',
      'fixed_discount',
      'buy_x_get_y',
      'bulk_price',
      'tiered_pricing',
    ],
  })
  type: PricingRuleType;

  /** Higher priority rules apply first (default: 0) */
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date | null;

  /** Flexible JSON conditions for rule matching */
  @Column({ type: 'jsonb', default: {} })
  conditions: PricingRuleConditions;

  /** JSON actions defining what the rule does */
  @Column({ type: 'jsonb', default: {} })
  actions: PricingRuleActions;

  /** Whether this rule can be combined with other rules */
  @Column({ default: false })
  stackable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
