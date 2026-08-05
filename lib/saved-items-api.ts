import { apiUrl } from './api';
import { getAuthHeaders, getAuthToken } from '@/context/AuthContext';
import { getProductImage } from './images';

/** A saved product, flattened for rendering. */
export interface SavedItem {
    productId: number;
    name: string;
    price: number;
    image: string;
    category: string;
    requiresPrescription: boolean;
}

interface ApiSavedItem {
    productId: number;
    product?: {
        id: number;
        title?: string;
        price?: number | string;
        category?: string;
        images?: string[];
        prescription_required?: boolean;
    };
}

async function toError(response: Response, fallback: string): Promise<Error> {
    try {
        const body = await response.json();
        const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
        return new Error(message || fallback);
    } catch {
        return new Error(fallback);
    }
}

export async function fetchSavedItems(): Promise<SavedItem[]> {
    if (!getAuthToken()) return [];

    const response = await fetch(apiUrl('saved-items'), { headers: getAuthHeaders() });
    if (!response.ok) throw await toError(response, 'Could not load your saved items.');

    const rows: ApiSavedItem[] = await response.json();
    return rows
        // A product deleted from the catalogue leaves the join empty; skip it
        // rather than rendering a card with no name or price.
        .filter(row => row.product)
        .map(row => ({
            productId: row.productId,
            name: row.product!.title ?? 'Unnamed product',
            price: Number(row.product!.price ?? 0),
            image: getProductImage(row.product!.images?.[0] ?? ''),
            category: row.product!.category ?? '',
            requiresPrescription: row.product!.prescription_required === true,
        }));
}

export async function saveItem(productId: number): Promise<void> {
    const response = await fetch(apiUrl(`saved-items/${productId}`), {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw await toError(response, 'Could not save this item.');
}

export async function unsaveItem(productId: number): Promise<void> {
    const response = await fetch(apiUrl(`saved-items/${productId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw await toError(response, 'Could not remove this item.');
}
