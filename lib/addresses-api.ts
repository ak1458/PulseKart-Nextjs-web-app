import { apiUrl } from './api';
import { getAuthHeaders, getAuthToken } from '@/context/AuthContext';

export type AddressLabel = 'home' | 'work' | 'other';

export interface Address {
    id: string;
    label: AddressLabel;
    recipientName: string;
    phone: string;
    line1: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean };

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

/** Returns [] rather than throwing when signed out, so pages can render. */
export async function fetchAddresses(): Promise<Address[]> {
    if (!getAuthToken()) return [];

    const response = await fetch(apiUrl('addresses'), { headers: getAuthHeaders() });
    if (!response.ok) throw await toError(response, 'Could not load your addresses.');
    return response.json();
}

export async function createAddress(input: AddressInput): Promise<Address> {
    const response = await fetch(apiUrl('addresses'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
    });
    if (!response.ok) throw await toError(response, 'Could not save this address.');
    return response.json();
}

export async function deleteAddress(id: string): Promise<void> {
    const response = await fetch(apiUrl(`addresses/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw await toError(response, 'Could not delete this address.');
}

export async function setDefaultAddress(id: string): Promise<Address> {
    const response = await fetch(apiUrl(`addresses/${id}/default`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw await toError(response, 'Could not set the default address.');
    return response.json();
}
