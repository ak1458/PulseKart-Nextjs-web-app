import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import type { PaymentMethodCode } from '../entities/payment-method.entity';

export const paymentMetadataSchema = z
  .record(z.string(), z.unknown())
  .optional();

export const processPaymentSchema = z.object({
  orderId: z
    .string()
    .min(1, 'Order ID is required')
    .max(100, 'Order ID must be at most 100 characters'),
  paymentMethodCode: z.enum(['cod', 'upi', 'card', 'netbanking', 'wallet']),
  amount: z.number().positive('Amount must be positive'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .default('INR')
    .transform((val) => val.toUpperCase()),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  gatewayResponse: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(['success', 'failed', 'pending']).optional(),
});

export const refundPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z
    .string()
    .max(500, 'Reason must be at most 500 characters')
    .optional(),
});

export class ProcessPaymentDto extends createZodDto(processPaymentSchema) {}

export class VerifyPaymentDto extends createZodDto(verifyPaymentSchema) {}

export class RefundPaymentDto extends createZodDto(refundPaymentSchema) {}

/**
 * Interface for payment intent response
 */
export interface PaymentIntent {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  redirectUrl?: string;
  qrCode?: string;
  upiIntent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for refund result
 */
export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: string;
  message?: string;
}

/**
 * Interface for payment verification result
 */
export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  status: string;
  amount: number;
  message?: string;
}

/**
 * DTO for transaction filters
 */
export const transactionFiltersSchema = z.object({
  userId: z.number().optional(),
  orderId: z.string().optional(),
  paymentMethodCode: z
    .enum(['cod', 'upi', 'card', 'netbanking', 'wallet'])
    .optional(),
  status: z
    .enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded',
      'cancelled',
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

export class TransactionFiltersDto extends createZodDto(
  transactionFiltersSchema,
) {}
