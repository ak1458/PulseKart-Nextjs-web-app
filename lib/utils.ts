/**
 * Utility functions for safe number parsing and calculations
 */

/**
 * Safely parse a value to number, returning default if invalid
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
    if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}

/**
 * Safely parse an integer value
 */
export function safeInteger(value: unknown, defaultValue = 0): number {
    if (typeof value === 'number') return isNaN(value) ? defaultValue : Math.floor(value);
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
    const safeAmount = safeNumber(amount);
    return `₹${safeAmount.toFixed(2)}`;
}

/**
 * Format number with Indian number system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
    const safeNum = safeNumber(num);
    if (safeNum >= 10000000) {
        return `${(safeNum / 10000000).toFixed(2)} Cr`;
    }
    if (safeNum >= 100000) {
        return `${(safeNum / 100000).toFixed(2)} L`;
    }
    return safeNum.toLocaleString('en-IN');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
    const cloned = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
