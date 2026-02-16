/**
 * Centralized API configuration for PulseKart
 * 
 * In development, Next.js rewrites /api/v1/* to http://localhost:4000/v1/*
 * In production, set NEXT_PUBLIC_API_URL to your actual API endpoint
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

/**
 * Build a full API URL for the given path
 * @param path - API path without leading slash (e.g. 'products', 'auth/login')
 * @returns Full API URL
 */
export function apiUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Build an API URL for server-side requests (bypasses Next.js rewrites)
 * Used in server components where relative URLs don't work
 * @param path - API path without leading slash
 * @returns Full API URL pointing directly to backend
 */
export function serverApiUrl(path: string): string {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000/v1';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${backendUrl}/${cleanPath}`;
}
