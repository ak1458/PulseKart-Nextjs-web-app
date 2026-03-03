import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createReviewSchema = z.object({
    productId: z.number(),
    userId: z.number(),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    comment: z.string().optional(),
    isVerifiedPurchase: z.boolean().optional().default(false),
});

export class CreateReviewDto extends createZodDto(createReviewSchema) { }

export const updateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().optional(),
    comment: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export class UpdateReviewDto extends createZodDto(updateReviewSchema) { }
