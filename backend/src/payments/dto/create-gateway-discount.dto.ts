import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createGatewayDiscountSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional()
      .nullable(),
    paymentMethodCode: z.enum(['cod', 'upi', 'card', 'netbanking', 'wallet']),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive('Discount value must be positive'),
    maxDiscountAmount: z
      .number()
      .positive('Max discount amount must be positive')
      .nullable()
      .optional(),
    minOrderAmount: z
      .number()
      .nonnegative('Min order amount cannot be negative')
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
    startDate: z
      .string()
      .datetime({ message: 'Start date must be a valid ISO datetime string' })
      .nullable()
      .optional(),
    endDate: z
      .string()
      .datetime({ message: 'End date must be a valid ISO datetime string' })
      .nullable()
      .optional(),
    usageLimit: z
      .number()
      .int('Usage limit must be an integer')
      .nonnegative('Usage limit cannot be negative')
      .default(0),
  })
  .refine(
    (data) => {
      // If type is percentage, value should not exceed 100
      if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage discount value cannot exceed 100',
      path: ['discountValue'],
    },
  )
  .refine(
    (data) => {
      // If both dates are provided, end date should be after start date
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      // Max discount amount should only be provided for percentage discounts
      if (data.discountType === 'fixed' && data.maxDiscountAmount) {
        return false;
      }
      return true;
    },
    {
      message:
        'Max discount amount should only be set for percentage discounts',
      path: ['maxDiscountAmount'],
    },
  );

export const updateGatewayDiscountSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .nullable(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z
    .number()
    .positive('Discount value must be positive')
    .optional(),
  maxDiscountAmount: z
    .number()
    .positive('Max discount amount must be positive')
    .nullable()
    .optional(),
  minOrderAmount: z
    .number()
    .nonnegative('Min order amount cannot be negative')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
  startDate: z
    .string()
    .datetime({ message: 'Start date must be a valid ISO datetime string' })
    .nullable()
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'End date must be a valid ISO datetime string' })
    .nullable()
    .optional(),
  usageLimit: z
    .number()
    .int('Usage limit must be an integer')
    .nonnegative('Usage limit cannot be negative')
    .optional(),
});

export class CreateGatewayDiscountDto extends createZodDto(
  createGatewayDiscountSchema,
) {}

export class UpdateGatewayDiscountDto extends createZodDto(
  updateGatewayDiscountSchema,
) {}

/**
 * DTO for discount calculation response
 */
export interface DiscountCalculationResult {
  applicable: boolean;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  discountName?: string;
  discountDescription?: string;
  message?: string;
}
