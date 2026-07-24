import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this when rendering user-generated content
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
        // Server-side: return escaped string
        return escapeHtml(dirty);
    }
    // Client-side: use DOMPurify
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
}

/**
 * Escape HTML entities to prevent XSS
 * Use this for simple text content
 */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitize a URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    // Relative URLs cannot carry a protocol, so they are safe by construction.
    // Checked before parsing because this function also runs during SSR.
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url;
    }

    // On the server there is no `window`. Referencing window.location.origin
    // unconditionally threw a ReferenceError that the catch below swallowed,
    // so every absolute URL rendered server-side silently became '#' and then
    // changed to the real href after hydration.
    const base = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost';

    try {
        const parsed = new URL(url, base);
        return allowedProtocols.includes(parsed.protocol) ? url : '#';
    } catch {
        return '#';
    }
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = email.trim().toLowerCase();
    return emailRegex.test(trimmed) ? trimmed : '';
}

/**
 * Sanitize phone number - remove all non-numeric characters
 */
export function sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

/**
 * Validate Indian pincode (6 digits)
 */
export function isValidPincode(pincode: string): boolean {
    return /^\d{6}$/.test(pincode.replace(/\D/g, ''));
}

/**
 * Validate Indian phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
    const sanitized = phone.replace(/\D/g, '');
    return sanitized.length === 10 && /^[6-9]/.test(sanitized);
}
