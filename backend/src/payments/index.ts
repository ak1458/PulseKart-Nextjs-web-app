// Entities
export { PaymentMethod } from './entities/payment-method.entity';
export type {
  PaymentMethodCode,
  PaymentMethodConfig,
} from './entities/payment-method.entity';
export { PaymentGatewayDiscount } from './entities/payment-gateway-discount.entity';
export type { DiscountType } from './entities/payment-gateway-discount.entity';
export { PaymentTransaction } from './entities/payment-transaction.entity';
export type {
  PaymentStatus,
  PaymentMetadata,
  GatewayResponse,
} from './entities/payment-transaction.entity';

// DTOs
export {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  paymentMethodConfigSchema,
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from './dto/create-payment-method.dto';

export {
  CreateGatewayDiscountDto,
  UpdateGatewayDiscountDto,
  createGatewayDiscountSchema,
  updateGatewayDiscountSchema,
} from './dto/create-gateway-discount.dto';
export type { DiscountCalculationResult } from './dto/create-gateway-discount.dto';

export {
  ProcessPaymentDto,
  VerifyPaymentDto,
  RefundPaymentDto,
  TransactionFiltersDto,
  processPaymentSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
  transactionFiltersSchema,
} from './dto/process-payment.dto';
export type {
  PaymentIntent,
  RefundResult,
  PaymentVerificationResult,
} from './dto/process-payment.dto';

// Interfaces
export {
  BasePaymentGateway,
  PaymentGatewayFactory,
  MockPaymentGateway,
} from './interfaces/payment-gateway.interface';
export type {
  PaymentGateway,
  GatewayConfig,
  CreatePaymentIntentParams,
  VerifyPaymentParams,
  RefundParams,
} from './interfaces/payment-gateway.interface';

// Service & Controller
export { PaymentsService } from './payments.service';
export type {
  ActivePaymentMethodResponse,
  PaymentHistoryResponse,
} from './payments.service';
export {
  PaymentsController,
  AdminPaymentsController,
} from './payments.controller';

// Module
export { PaymentsModule } from './payments.module';
