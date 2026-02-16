const PLACEHOLDER_PATTERNS = [
    /placehold\.co/i,
    /via\.placeholder\.com/i,
    /dummyimage\.com/i,
    /ui-avatars\.com/i,
];

export function isPlaceholderImage(url?: string | null): boolean {
    if (!url) return true;
    return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(url));
}

export function getProductImage(url?: string | null, fallback = '/images/product-placeholder.svg'): string {
    if (!url || isPlaceholderImage(url)) return fallback;
    return url;
}

export function getAvatarImage(url?: string | null, fallback = '/avatars/default.svg'): string {
    if (!url || isPlaceholderImage(url)) return fallback;
    return url;
}
