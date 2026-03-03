import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const paymentMethodConfigSchema = z.object({
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  merchantId: z.string().optional(),
  merchantName: z.string().optional(),
  webhookSecret: z.string().optional(),
  sandboxMode: z.boolean().optional(),
  additionalConfig: z.record(z.string(), z.unknown()).optional(),
});

export const createPaymentMethodSchema = z
  .object({
    code: z.enum(['cod', 'upi', 'card', 'netbanking', 'wallet']),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional()
      .nullable(),
    iconUrl: z
      .string()
      .url('Icon URL must be a valid URL')
      .max(500, 'Icon URL must be at most 500 characters')
      .optional()
      .nullable(),
    isActive: z.boolean().default(true),
    isTestMode: z.boolean().default(true),
    config: paymentMethodConfigSchema.default(
      {} as z.infer<typeof paymentMethodConfigSchema>,
    ),
    supportedCurrencies: z
      .array(z.string().length(3))
      .default(['INR'])
      .refine((arr) => arr.every((c) => c === c.toUpperCase()), {
        message: 'Currency codes must be uppercase',
      }),
    minAmount: z
      .number()
      .nonnegative('Min amount cannot be negative')
      .nullable()
      .optional(),
    maxAmount: z
      .number()
      .positive('Max amount must be positive')
      .nullable()
      .optional(),
    processingFee: z
      .number()
      .nonnegative('Processing fee cannot be negative')
      .default(0),
    processingFeePercent: z
      .number()
      .nonnegative('Processing fee percentage cannot be negative')
      .max(100, 'Processing fee percentage cannot exceed 100')
      .default(0),
    sortOrder: z.number().int('Sort order must be an integer').default(0),
  })
  .refine(
    (data) => {
      // If both min and max are set, max should be greater than min
      if (
        data.minAmount &&
        data.maxAmount &&
        data.maxAmount <= data.minAmount
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Max amount must be greater than min amount',
      path: ['maxAmount'],
    },
  );

export const updatePaymentMethodSchema = z.object({
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
  iconUrl: z
    .string()
    .url('Icon URL must be a valid URL')
    .max(500, 'Icon URL must be at most 500 characters')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  isTestMode: z.boolean().optional(),
  config: paymentMethodConfigSchema.optional(),
  supportedCurrencies: z.array(z.string().length(3)).optional(),
  minAmount: z
    .number()
    .nonnegative('Min amount cannot be negative')
    .nullable()
    .optional(),
  maxAmount: z
    .number()
    .positive('Max amount must be positive')
    .nullable()
    .optional(),
  processingFee: z
    .number()
    .nonnegative('Processing fee cannot be negative')
    .optional(),
  processingFeePercent: z
    .number()
    .nonnegative('Processing fee percentage cannot be negative')
    .max(100, 'Processing fee percentage cannot exceed 100')
    .optional(),
  sortOrder: z.number().int('Sort order must be an integer').optional(),
});

export class CreatePaymentMethodDto extends createZodDto(
  createPaymentMethodSchema,
) {}

export class UpdatePaymentMethodDto extends createZodDto(
  updatePaymentMethodSchema,
) {}
