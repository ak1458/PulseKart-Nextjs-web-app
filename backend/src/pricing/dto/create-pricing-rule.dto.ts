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
            'Time of day must be in format "HH:MM-HH:MM"'
        )
        .optional(),
    dayOfWeek: z
        .array(z.number().int().min(0).max(6))
        .optional(),
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

export const createPricingRuleSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        description: z.string().optional(),
        type: z.enum([
            'percentage_discount',
            'fixed_discount',
            'buy_x_get_y',
            'bulk_price',
            'tiered_pricing',
        ]),
        priority: z.number().int().default(0),
        isActive: z.boolean().default(true),
        startDate: z.string().datetime().optional().nullable(),
        endDate: z.string().datetime().optional().nullable(),
        conditions: conditionsSchema.default({}),
        actions: actionsSchema.default({}),
        stackable: z.boolean().default(false),
    })
    .refine(
        (data) => {
            // Validate that endDate is after startDate if both are provided
            if (data.startDate && data.endDate) {
                return new Date(data.endDate) > new Date(data.startDate);
            }
            return true;
        },
        {
            message: 'End date must be after start date',
            path: ['endDate'],
        }
    )
    .refine(
        (data) => {
            // Validate type-specific required actions
            switch (data.type) {
                case 'percentage_discount':
                    return data.actions.discountPercent !== undefined;
                case 'fixed_discount':
                    return data.actions.discountAmount !== undefined;
                case 'buy_x_get_y':
                    return (
                        data.actions.buyQuantity !== undefined &&
                        data.actions.getQuantity !== undefined
                    );
                case 'bulk_price':
                    return data.actions.bulkPrice !== undefined;
                case 'tiered_pricing':
                    return (
                        data.actions.tiers !== undefined &&
                        data.actions.tiers.length > 0
                    );
                default:
                    return true;
            }
        },
        {
            message: 'Actions must contain the required fields for the selected rule type',
            path: ['actions'],
        }
    );

export class CreatePricingRuleDto extends createZodDto(createPricingRuleSchema) {}
