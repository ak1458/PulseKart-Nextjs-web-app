import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const tierSchema = z.object({
  minQty: z.number().int().positive('Minimum quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

const conditionsSchema = z.object({
  minQuantity: z.number().int().positive().optional(),
  maxQuantity: z.number().int().positive().optional(),
  minOrderValue: z.number().positive().optional(),
  maxOrderValue: z.number().positive().optional(),
  productIds: z.array(z.number().int().positive()).optional(),
  categoryIds: z.array(z.string()).optional(),
  userTags: z.array(z.string()).optional(),
  timeOfDay: z
    .string()
    .regex(
      /^([0-1]?\d|2[0-3]):([0-5]\d)-([0-1]?\d|2[0-3]):([0-5]\d)$/,
      'Time of day must be in format "HH:MM-HH:MM"',
    )
    .optional(),
  dayOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
});

const actionsSchema = z.object({
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().positive().optional(),
  buyQuantity: z.number().int().positive().optional(),
  getQuantity: z.number().int().positive().optional(),
  getProductId: z.number().int().positive().optional(),
  bulkPrice: z.number().positive().optional(),
  tiers: z.array(tierSchema).optional(),
});

export const updatePricingRuleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  type: z
    .enum([
      'percentage_discount',
      'fixed_discount',
      'buy_x_get_y',
      'bulk_price',
      'tiered_pricing',
    ])
    .optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  conditions: conditionsSchema.optional(),
  actions: actionsSchema.optional(),
  stackable: z.boolean().optional(),
});

export class UpdatePricingRuleDto extends createZodDto(
  updatePricingRuleSchema,
) {}
