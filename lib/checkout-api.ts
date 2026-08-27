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

/** An order as the customer dashboard renders it. */
export interface CustomerOrder {
    id: string;
    date: string;
    /** Display status: 'Delivered' | 'In Progress' | 'Cancelled' | 'Rx Pending'. */
    status: string;
    total: number;
    payment: string;
    address: string;
    items: { name: string; quantity: number; price: number; image: string | null }[];
    timeline: { label: string; done: boolean }[];
}

/** Raw order shape returned by the API. */
interface ApiOrder {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    paymentMethod: string | null;
    prescriptionId: string | null;
    shippingAddress: Record<string, unknown> | null;
    createdAt: string;
    shippedAt: string | null;
    deliveredAt: string | null;
    items?: { name: string; quantity: number; price: number; image: string | null }[];
}

/**
 * Map an order onto the labels the dashboard filters by.
 *
 * The API's statuses are the lifecycle values (`created`, `processing`,
 * `shipped`…); the UI groups them into four buckets.
 */
function toDisplayStatus(order: ApiOrder): string {
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'cancelled' || order.status === 'refunded') return 'Cancelled';
    return 'In Progress';
}

function formatAddress(address: Record<string, unknown> | null): string {
    if (!address) return 'No delivery address on file';
    const parts = ['address', 'city', 'pincode']
        .map(key => address[key])
        .filter((v): v is string => typeof v === 'string' && v.length > 0);
    return parts.length > 0 ? parts.join(', ') : 'No delivery address on file';
}

function normalizeOrder(order: ApiOrder): CustomerOrder {
    return {
        id: order.id,
        date: new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        }),
        status: toDisplayStatus(order),
        total: order.totalAmount,
        payment: order.paymentMethod ?? 'Not specified',
        address: formatAddress(order.shippingAddress),
        items: order.items ?? [],
        timeline: [
            { label: 'Order placed', done: true },
            { label: 'Shipped', done: order.shippedAt !== null },
            { label: 'Delivered', done: order.deliveredAt !== null },
        ],
    };
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

/** Orders belonging to the signed-in customer, newest first. */
export async function fetchMyOrders(): Promise<CustomerOrder[]> {
    if (!isSignedIn()) return [];

    const response = await fetch(apiUrl('orders/mine'), {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw await toError(response, 'Could not load your orders.');
    }

    const orders: ApiOrder[] = await response.json();
    return orders.map(normalizeOrder);
}

/** Prescriptions belonging to the signed-in customer, newest first. */
export async function fetchPrescriptions(): Promise<PrescriptionSummary[]> {
    if (!isSignedIn()) return [];

    const response = await fetch(apiUrl('prescriptions'), {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw await toError(response, 'Could not load your prescriptions.');
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
