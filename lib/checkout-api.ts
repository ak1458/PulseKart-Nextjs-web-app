import { apiUrl } from './api';
import { getAuthHeaders, getAuthToken } from '@/context/AuthContext';

export type PaymentMethod = 'UPI' | 'CARD' | 'COD';

export interface QuoteLine {
    productId: number;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    taxRate: number;
    taxAmount: number;
    requiresPrescription: boolean;
    image: string | null;
}

/**
 * The server's pricing breakdown.
 *
 * The storefront renders these numbers; it does not compute its own. Delivery
 * thresholds, COD fees and discount rules live in `backend/src/orders/order-pricing.ts`
 * so there is exactly one definition of what an order costs.
 */
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

export interface PrescriptionSummary {
    id: string;
    status: 'pending_review' | 'approved' | 'rejected';
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}

export interface PlacedOrder {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    itemsCount: number;
}

export interface CartLineRequest {
    productId: number;
    quantity: number;
}

/** Extract a useful message from an error response body. */
async function toError(response: Response, fallback: string): Promise<Error> {
    try {
        const body = await response.json();
        const message = Array.isArray(body?.message)
            ? body.message.join(', ')
            : body?.message || body?.error;
        return new Error(message || fallback);
    } catch {
        return new Error(fallback);
    }
}

export function isSignedIn(): boolean {
    return getAuthToken() !== null;
}

/** Price a cart without placing an order. */
export async function fetchQuote(input: {
    items: CartLineRequest[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
}): Promise<OrderQuote> {
    const response = await fetch(apiUrl('orders/quote'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw await toError(response, 'Could not price your cart. Please try again.');
    }

    return response.json();
}

/** Place the order. Returns the persisted order. */
export async function placeOrder(input: {
    items: CartLineRequest[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
    prescriptionId?: string;
    shippingAddress?: Record<string, unknown>;
}): Promise<PlacedOrder> {
    const response = await fetch(apiUrl('orders/checkout'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw await toError(response, 'We could not place your order. Please try again.');
    }

    return response.json();
}

/**
 * Upload a prescription and return its stored record.
 *
 * Note the deliberate absence of a Content-Type header: the browser must set
 * the multipart boundary itself, and overriding it breaks the upload.
 */
export async function uploadPrescription(file: File): Promise<PrescriptionSummary> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('prescription', file);

    const response = await fetch(apiUrl('prescriptions'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!response.ok) {
        throw await toError(response, 'Prescription upload failed. Please try again.');
    }

    return response.json();
}
