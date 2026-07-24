/**
 * Order pricing rules - the single authoritative definition.
 *
 * These previously lived in the browser (`lib/constants.ts` on the frontend),
 * which meant the customer's device decided delivery fees and discounts, and the
 * two copies had already drifted apart. The frontend now renders whatever
 * `POST /v1/orders/quote` returns instead of recomputing anything.
 */
export const PRICING = {
    /** Order subtotal at or above which delivery is free (INR). */
    FREE_DELIVERY_THRESHOLD: 500,
    /** Delivery charge applied below the free threshold (INR). */
    DELIVERY_FEE: 40,
    /** Handling fee added to cash-on-delivery orders (INR). */
    COD_FEE: 50,
    /** Discount for paying by UPI, as a percentage of subtotal. */
    UPI_DISCOUNT_PERCENT: 5,
} as const;

export type PaymentMethod = 'UPI' | 'CARD' | 'COD';

export const PAYMENT_METHODS: readonly PaymentMethod[] = ['UPI', 'CARD', 'COD'];

/** Round to 2dp to match the `decimal(10,2)` money columns. */
export function round2(value: number): number {
    const n = typeof value === 'number' ? value : Number(value ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface QuoteLine {
    productId: number;
    name: string;
    /** Unit price from the catalogue, never from the request. */
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    taxRate: number;
    taxAmount: number;
    requiresPrescription: boolean;
    image: string | null;
}

export interface OrderQuote {
    lines: QuoteLine[];
    itemsCount: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    codFee: number;
    discount: number;
    total: number;
    couponCode: string | null;
    couponMessage: string | null;
    requiresPrescription: boolean;
}

/**
 * Compute the monetary breakdown for a set of priced lines.
 *
 * `couponDiscount` is supplied by the caller because validating a coupon needs
 * database access; everything else here is pure so it can be unit tested.
 *
 * A coupon and the UPI discount do not stack - the customer gets whichever is
 * worth more. The previous frontend silently dropped the UPI discount whenever a
 * coupon was applied, even when the UPI discount was larger.
 */
export function buildQuote(
    lines: QuoteLine[],
    paymentMethod: PaymentMethod,
    couponDiscount: number,
    couponCode: string | null,
    couponMessage: string | null,
): OrderQuote {
    const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    const tax = round2(lines.reduce((sum, l) => sum + l.taxAmount, 0));
    const itemsCount = lines.reduce((sum, l) => sum + l.quantity, 0);

    const deliveryFee =
        subtotal >= PRICING.FREE_DELIVERY_THRESHOLD || subtotal === 0
            ? 0
            : PRICING.DELIVERY_FEE;

    const codFee = paymentMethod === 'COD' ? PRICING.COD_FEE : 0;

    const upiDiscount =
        paymentMethod === 'UPI'
            ? round2(subtotal * (PRICING.UPI_DISCOUNT_PERCENT / 100))
            : 0;

    const discount = round2(Math.min(Math.max(couponDiscount, upiDiscount), subtotal));

    const total = round2(subtotal + tax + deliveryFee + codFee - discount);

    return {
        lines,
        itemsCount,
        subtotal,
        tax,
        deliveryFee,
        codFee,
        discount,
        total: Math.max(0, total),
        couponCode: couponDiscount >= upiDiscount ? couponCode : null,
        couponMessage,
        requiresPrescription: lines.some((l) => l.requiresPrescription),
    };
}
