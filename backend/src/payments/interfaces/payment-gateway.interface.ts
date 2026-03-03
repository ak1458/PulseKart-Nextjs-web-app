/**
 * Payment Gateway Interface
 *
 * This interface defines the contract for payment gateway providers.
 * Implement this interface for specific providers like Razorpay, Stripe, etc.
 */

import {
  PaymentIntent,
  RefundResult,
  PaymentVerificationResult,
} from '../dto/process-payment.dto';

export interface GatewayConfig {
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  sandboxMode?: boolean;
  [key: string]: unknown;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  orderId: string;
  userId: number;
  metadata?: Record<string, unknown>;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

export interface VerifyPaymentParams {
  transactionId: string;
  gatewayResponse: Record<string, unknown>;
  signature?: string;
}

export interface RefundParams {
  transactionId: string;
  gatewayTransactionId: string;
  amount: number;
  reason?: string;
}

export interface PaymentGateway {
  readonly name: string;

  /**
   * Initialize the payment gateway with configuration
   */
  initialize(config: GatewayConfig): void;

  /**
   * Check if the gateway is properly initialized and ready
   */
  isReady(): boolean;

  /**
   * Create a payment intent/order
   */
  createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntent>;

  /**
   * Verify a payment after completion/callback
   */
  verifyPayment(
    params: VerifyPaymentParams,
  ): Promise<PaymentVerificationResult>;

  /**
   * Process a refund
   */
  refund(params: RefundParams): Promise<RefundResult>;

  /**
   * Generate signature for webhook verification
   */
  generateSignature?(payload: string, secret: string): string;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature?(
    payload: string,
    signature: string,
    secret: string,
  ): boolean;
}

/**
 * Abstract base class for payment gateways
 * Provides common functionality and structure
 */
export abstract class BasePaymentGateway implements PaymentGateway {
  abstract readonly name: string;

  protected config: GatewayConfig | null = null;
  protected initialized = false;

  initialize(config: GatewayConfig): void {
    this.config = config;
    this.initialized = true;
  }

  isReady(): boolean {
    return this.initialized && this.config !== null;
  }

  abstract createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntent>;

  abstract verifyPayment(
    params: VerifyPaymentParams,
  ): Promise<PaymentVerificationResult>;

  abstract refund(params: RefundParams): Promise<RefundResult>;

  protected validateConfig(): GatewayConfig {
    if (!this.isReady()) {
      throw new Error(`Payment gateway ${this.name} is not initialized`);
    }
    return this.config!;
  }

  protected validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a valid number');
    }
  }
}

/**
 * Factory for creating payment gateway instances
 */
export class PaymentGatewayFactory {
  private static gateways = new Map<string, new () => PaymentGateway>();

  /**
   * Register a payment gateway implementation
   */
  static register(code: string, gatewayClass: new () => PaymentGateway): void {
    this.gateways.set(code, gatewayClass);
  }

  /**
   * Create a payment gateway instance
   */
  static create(code: string): PaymentGateway {
    const GatewayClass = this.gateways.get(code);
    if (!GatewayClass) {
      throw new Error(`Payment gateway '${code}' is not registered`);
    }
    return new GatewayClass();
  }

  /**
   * Check if a gateway is registered
   */
  static isRegistered(code: string): boolean {
    return this.gateways.has(code);
  }

  /**
   * Get list of registered gateway codes
   */
  static getRegisteredGateways(): string[] {
    return Array.from(this.gateways.keys());
  }
}

/**
 * Example mock gateway implementation for testing
 */
export class MockPaymentGateway extends BasePaymentGateway {
  readonly name = 'MockGateway';

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntent> {
    this.validateConfig();
    this.validateAmount(params.amount);

    return {
      id: `mock_${Date.now()}`,
      transactionId: `txn_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      status: 'created',
      clientSecret: `mock_secret_${Date.now()}`,
      metadata: params.metadata,
    };
  }

  async verifyPayment(
    params: VerifyPaymentParams,
  ): Promise<PaymentVerificationResult> {
    this.validateConfig();

    // Mock verification - always succeeds
    return {
      success: true,
      transactionId: params.transactionId,
      status: 'completed',
      amount: 0,
      message: 'Payment verified successfully (mock)',
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    this.validateConfig();
    this.validateAmount(params.amount);

    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      amount: params.amount,
      status: 'completed',
      message: 'Refund processed successfully (mock)',
    };
  }
}

// Register the mock gateway for testing
PaymentGatewayFactory.register('mock', MockPaymentGateway);
