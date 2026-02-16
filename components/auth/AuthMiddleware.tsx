'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, getAuthToken } from '@/context/AuthContext';
import { apiUrl } from '@/lib/api';

// Routes that don't require authentication - extensive list for e-commerce
const PUBLIC_ROUTES = [
    // Auth pages
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/admin/login',
    // Main pages
    '/',
    '/about',
    '/contact',
    '/help',
    '/support',
    '/privacy',
    '/terms',
    '/faq',
    // Product pages
    '/products',
    '/shop',
    '/categories',
    '/brands',
    '/search',
    // Cart - accessible to guests
    '/cart',
    '/checkout', // Can be accessed by guests (will ask for login at final step)
    // Content pages
    '/blog',
    '/doctors',
    '/consult',
    '/health',
    '/upload-rx',
    '/rider',
    // Order confirmation (after guest checkout)
    '/order-confirmation',
    '/order-tracking',
];

// Routes that are only for non-authenticated users (auth pages)
const AUTH_ONLY_ROUTES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/admin/login',
];

// Routes that require admin access
const ADMIN_ROUTES = ['/admin'];

// Dynamic public route patterns (regex)
const PUBLIC_ROUTE_PATTERNS = [
    /^\/product\/[^\/]+$/, // /product/[slug]
    /^\/category\/[^\/]+$/, // /category/[slug]
    /^\/brand\/[^\/]+$/, // /brand/[slug]
    /^\/blog\/[^\/]+$/, // /blog/[slug]
    /^\/order-tracking\/[^\/]+$/, // /order-tracking/[id]
];

interface AuthMiddlewareProps {
    children: React.ReactNode;
}

/**
 * AuthMiddleware Component
 * 
 * Global middleware wrapper that handles:
 * - Token refresh logic
 * - Auto-redirect on token expiry
 * - Route access control based on authentication status
 * - Periodic token validation
 */
export default function AuthMiddleware({ children }: AuthMiddlewareProps) {
    const { user, isAuthenticated, isLoading, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isCheckingRef = useRef(false);
    const lastValidatedPath = useRef<string>('');

    // Check if a route is public
    const isPublicRoute = useCallback((path: string): boolean => {
        // Check exact matches
        if (PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`))) {
            return true;
        }
        // Check dynamic patterns
        if (PUBLIC_ROUTE_PATTERNS.some(pattern => pattern.test(path))) {
            return true;
        }
        return false;
    }, []);

    // Check if a route is auth-only (for non-authenticated users)
    const isAuthOnlyRoute = useCallback((path: string): boolean => {
        return AUTH_ONLY_ROUTES.some(route =>
            path === route || path.startsWith(`${route}/`)
        );
    }, []);

    // Check if a route requires admin access
    const isAdminRoute = useCallback((path: string): boolean => {
        // /admin/login is NOT an admin route (it's an auth page)
        if (path === '/admin/login' || path.startsWith('/admin/login/')) {
            return false;
        }
        return ADMIN_ROUTES.some(route =>
            path === route || path.startsWith(`${route}/`)
        );
    }, []);

    // Validate token with the server
    const validateToken = useCallback(async (): Promise<boolean> => {
        const token = getAuthToken();
        if (!token) return false;

        try {
            const response = await fetch(apiUrl('auth/me'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    // Handle route protection
    useEffect(() => {
        if (isLoading || isCheckingRef.current) return;

        const handleRouteProtection = async () => {
            // Skip if already validated for this path
            if (lastValidatedPath.current === pathname) {
                return;
            }

            isCheckingRef.current = true;

            try {
                // 1. Redirect authenticated users away from auth pages (login, signup, etc.)
                if (isAuthenticated && isAuthOnlyRoute(pathname)) {
                    router.push(isAdmin ? '/admin' : '/dashboard');
                    lastValidatedPath.current = pathname;
                    return;
                }

                // 2. Check admin route access - only if authenticated
                if (isAdminRoute(pathname)) {
                    if (!isAuthenticated) {
                        // Not logged in, redirect to admin login
                        router.push('/admin/login');
                        lastValidatedPath.current = pathname;
                        return;
                    }
                    if (!isAdmin) {
                        // Logged in but not admin, redirect to customer dashboard
                        router.push('/dashboard');
                        lastValidatedPath.current = pathname;
                        return;
                    }
                    // Admin is authenticated, allow access
                    lastValidatedPath.current = pathname;
                    return;
                }

                // 3. For protected non-admin routes, validate token
                if (!isPublicRoute(pathname)) {
                    // If not authenticated at all, redirect to login
                    if (!isAuthenticated) {
                        router.push('/login');
                        lastValidatedPath.current = pathname;
                        return;
                    }

                    // Validate token periodically (but not on every navigation)
                    const isValid = await validateToken();
                    if (!isValid) {
                        logout();
                        lastValidatedPath.current = pathname;
                        return;
                    }
                }

                lastValidatedPath.current = pathname;
            } finally {
                isCheckingRef.current = false;
            }
        };

        handleRouteProtection();
    }, [
        isLoading,
        isAuthenticated,
        isAdmin,
        pathname,
        router,
        logout,
        isAuthOnlyRoute,
        isPublicRoute,
        isAdminRoute,
        validateToken,
    ]);

    // Periodic token validation (every 5 minutes) - only when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const validateInterval = setInterval(async () => {
            const isValid = await validateToken();
            if (!isValid) {
                logout();
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(validateInterval);
    }, [isAuthenticated, logout, validateToken]);

    return <>{children}</>;
}

/**
 * Hook to use auth middleware features in components
 */
export function useAuthMiddleware() {
    const { isAuthenticated, isAdmin } = useAuth();
    const pathname = usePathname();

    const checkAccess = useCallback((requiredRole?: 'admin' | 'customer'): boolean => {
        if (!isAuthenticated) return false;
        if (requiredRole === 'admin' && !isAdmin) return false;
        return true;
    }, [isAuthenticated, isAdmin]);

    return {
        checkAccess,
        currentPath: pathname,
        isAuthenticated,
        isAdmin,
    };
}
