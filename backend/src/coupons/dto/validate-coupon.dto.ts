import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .transform((val) => val.toUpperCase()),
  cart_total: z.number().nonnegative('Cart total must be non-negative'),
  product_ids: z.array(z.string()).default([]),
  user_id: z.number().int().positive('User ID must be positive'),
});

export class ValidateCouponDto extends createZodDto(validateCouponSchema) {}
