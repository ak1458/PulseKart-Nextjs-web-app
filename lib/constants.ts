/**
 * Shared constants for the PulseKart application
 * Centralizes configuration to eliminate code duplication
 */

// ============================================================================
// Display-only pricing copy
// ============================================================================

/**
 * Figures quoted in marketing copy ("save 5% with UPI").
 *
 * DO NOT price an order with these. The authoritative rules live in
 * `backend/src/orders/order-pricing.ts`, and what the customer is actually
 * charged comes from `POST /v1/orders/quote`. These constants previously drove
 * the real checkout totals, which put the delivery threshold, COD fee and
 * discount rates under the customer's control and let the two copies disagree.
 *
 * Keep these in step with the server values when the server values change.
 */
export const PRICING_COPY = {
    /** Free delivery threshold, INR. */
    FREE_DELIVERY_THRESHOLD_INR: 500,
    /** Cash-on-delivery handling fee, INR. */
    COD_FEE_INR: 50,
    /** Headline discount for paying by UPI, percent. */
    UPI_DISCOUNT_PERCENT: 5,
} as const;

// ============================================================================
// Pagination Configuration
// ============================================================================

export const PAGINATION = {
    /** Default number of items per page */
    DEFAULT_PAGE_SIZE: 12,
    /** Maximum allowed page size */
    MAX_PAGE_SIZE: 100,
    /** Default page number */
    DEFAULT_PAGE: 1,
} as const;

// ============================================================================
// Cart Limits
// ============================================================================

export const CART_LIMITS = {
    /** Maximum quantity allowed per item */
    MAX_QUANTITY_PER_ITEM: 10,
    /** Maximum total items in cart */
    MAX_TOTAL_ITEMS: 50,
    /** Minimum order value in INR */
    MIN_ORDER_VALUE_INR: 1,
} as const;

// ============================================================================
// Payment Methods
// ============================================================================

export const PAYMENT_METHODS = {
    UPI: 'UPI',
    CARD: 'CARD',
    COD: 'COD',
    PREPAID: 'PREPAID',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

// ============================================================================
// Order Status
// ============================================================================

export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ============================================================================
// Time Constants (in milliseconds)
// ============================================================================

export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// Delivery Configuration
// ============================================================================

export const DELIVERY_CONFIG = {
    /** Express delivery cutoff time (7 PM) */
    EXPRESS_CUTOFF_HOUR: 19,
    /** Standard delivery days */
    STANDARD_DELIVERY_DAYS: 2,
    /** Express delivery message */
    EXPRESS_DELIVERY_MESSAGE: 'Today by 7:00 PM',
    /** Standard delivery message */
    STANDARD_DELIVERY_MESSAGE: 'Delivery in 2-3 days',
} as const;
