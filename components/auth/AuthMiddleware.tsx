'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, getAuthToken } from '@/context/AuthContext';
import { apiUrl } from '@/lib/api';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/',
    '/products',
    '/about',
    '/contact',
    '/cart',
];

// Routes that are only for non-authenticated users (auth pages)
const AUTH_ONLY_ROUTES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
];

// Routes that require admin access
const ADMIN_ROUTES = [
    '/admin',
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
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCheckingRef = useRef(false);

    // Check if a route is public
    const isPublicRoute = useCallback((path: string): boolean => {
        return PUBLIC_ROUTES.some(route => 
            path === route || path.startsWith(`${route}/`)
        );
    }, []);

    // Check if a route is auth-only (for non-authenticated users)
    const isAuthOnlyRoute = useCallback((path: string): boolean => {
        return AUTH_ONLY_ROUTES.some(route => 
            path === route || path.startsWith(`${route}/`)
        );
    }, []);

    // Check if a route requires admin access
    const isAdminRoute = useCallback((path: string): boolean => {
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
            isCheckingRef.current = true;

            try {
                // Redirect authenticated users away from auth pages
                if (isAuthenticated && isAuthOnlyRoute(pathname)) {
                    router.push(isAdmin ? '/admin' : '/dashboard');
                    return;
                }

                // Check admin route access
                if (isAdminRoute(pathname) && isAuthenticated && !isAdmin) {
                    router.push('/dashboard');
                    return;
                }

                // For protected routes, validate token
                if (!isPublicRoute(pathname)) {
                    const isValid = await validateToken();
                    if (!isValid && !isLoading) {
                        logout();
                        return;
                    }
                }
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
        validateToken
    ]);

    // Periodic token validation (every 5 minutes)
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

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
