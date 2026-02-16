'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from '@/lib/icons';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps pages that require authentication.
 * Redirects to /login if user is not authenticated.
 * Shows loading state while checking authentication.
 */
export default function ProtectedRoute({ 
    children, 
    fallback 
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after initial auth check is complete
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render children (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    // User is authenticated, render children
    return <>{children}</>;
}

/**
 * Higher-Order Component (HOC) version of ProtectedRoute
 * Useful for wrapping page components
 */
export function withProtection<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
