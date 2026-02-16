import { z } from 'zod';

export const couponValidationResponseSchema = z.object({
    is_valid: z.boolean(),
    discount_amount: z.number().nonnegative(),
    final_amount: z.number().nonnegative(),
    message: z.string(),
    coupon: z.object({
        id: z.string(),
        code: z.string(),
        type: z.enum(['percentage', 'fixed_amount']),
        value: z.number(),
    }).optional(),
});

export type CouponValidationResponse = z.infer<typeof couponValidationResponseSchema>;

export interface CouponListResponse {
    id: string;
    code: string;
    description: string | null;
    type: 'percentage' | 'fixed_amount';
    value: number;
    min_order_amount: number | null;
    max_discount_amount: number | null;
    usage_limit: number;
    usage_count: number;
    per_user_limit: number;
    start_date: Date | null;
    end_date: Date | null;
    is_active: boolean;
    applicable_products: 'all' | 'specific' | 'category';
    applicable_product_ids: string[];
    applicable_categories: string[];
    excluded_products: string[];
    created_at: Date;
    updated_at: Date;
}

export interface CouponFilters {
    is_active?: boolean;
    search?: string;
    type?: 'percentage' | 'fixed_amount';
}

export interface PaginationOptions {
    page: number;
    limit: number;
}
