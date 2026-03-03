import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const calculatePriceSchema = z.object({
    productId: z.number().int().positive('Product ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    price: z.number().positive().optional().describe('Product base price (optional, will be fetched from DB if not provided)'),
    userId: z.number().int().positive().optional(),
    cartTotal: z.number().positive().optional(),
    userTags: z.array(z.string()).optional(),
});

export class CalculatePriceDto extends createZodDto(calculatePriceSchema) {}

// Cart item for bulk calculation
export const cartItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    categoryId: z.string().optional(),
});

export const calculateCartSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'Cart must have at least one item'),
    userId: z.number().int().positive().optional(),
    userTags: z.array(z.string()).optional(),
});

export class CalculateCartDto extends createZodDto(calculateCartSchema) {}

// DTOs for query parameters
export const listPricingRulesSchema = z.object({
    isActive: z.enum(['true', 'false']).optional().transform((val) =>
        val === 'true' ? true : val === 'false' ? false : undefined
    ),
    type: z.enum([
        'percentage_discount',
        'fixed_discount',
        'buy_x_get_y',
        'bulk_price',
        'tiered_pricing',
    ]).optional(),
    search: z.string().optional(),
    limit: z.string().optional().transform((val) => {
        const num = parseInt(val || '50', 10);
        return isNaN(num) ? 50 : Math.min(Math.max(num, 1), 100);
    }),
    offset: z.string().optional().transform((val) => {
        const num = parseInt(val || '0', 10);
        return isNaN(num) ? 0 : Math.max(num, 0);
    }),
});

export class ListPricingRulesDto extends createZodDto(listPricingRulesSchema) {}
