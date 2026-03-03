import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCouponBaseSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(50, 'Code must be at most 50 characters')
        .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores')
        .transform((val) => val.toUpperCase()),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
    type: z.enum(['percentage', 'fixed_amount']),
    value: z.number()
        .positive('Value must be positive')
        .refine((val) => {
            // For percentage, max 100%
            return true;
        }, { message: 'Percentage value cannot exceed 100' }),
    min_order_amount: z.number().nonnegative().nullable().optional(),
    max_discount_amount: z.number().positive().nullable().optional(),
    usage_limit: z.number().int().nonnegative().default(0),
    per_user_limit: z.number().int().positive().default(1),
    start_date: z.string().datetime().nullable().optional(),
    end_date: z.string().datetime().nullable().optional(),
    is_active: z.boolean().default(true),
    applicable_products: z.enum(['all', 'specific', 'category']).default('all'),
    applicable_product_ids: z.array(z.string()).default([]),
    applicable_categories: z.array(z.string()).default([]),
    excluded_products: z.array(z.string()).default([]),
});

export const createCouponSchema = createCouponBaseSchema.refine((data) => {
    // If type is percentage, value should not exceed 100
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage value cannot exceed 100',
    path: ['value'],
}).refine((data) => {
    // If end_date is provided, it should be after start_date
    if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['end_date'],
});

export class CreateCouponDto extends createZodDto(createCouponSchema) { }
