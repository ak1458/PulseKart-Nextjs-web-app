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
    try {
        const parsed = new URL(url, window.location.origin);
        if (!allowedProtocols.includes(parsed.protocol)) {
            return '#';
        }
        return url;
    } catch {
        // If URL parsing fails, check if it's a relative URL
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return url;
        }
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
