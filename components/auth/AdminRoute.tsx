'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle } from '@/lib/icons';

interface AdminRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * AdminRoute Component
 * 
 * Wraps pages that require admin privileges.
 * Redirects to /dashboard if user is authenticated but not an admin.
 * Redirects to /login if user is not authenticated.
 * Shows loading state while checking authentication.
 */
export default function AdminRoute({ 
    children, 
    fallback 
}: AdminRouteProps) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after initial auth check is complete
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isAdmin) {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, isAdmin, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // If not authenticated or not admin, don't render children (redirect will happen)
    if (!isAuthenticated || !isAdmin) {
        // Show access denied UI briefly before redirect
        if (isAuthenticated && !isAdmin) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]">
                    <div className="flex flex-col items-center gap-4 text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Access Denied</h2>
                        <p className="text-gray-400 max-w-sm">
                            You don&apos;t have permission to access this page. Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    }

    // User is authenticated and is admin, render children
    return <>{children}</>;
}

/**
 * Higher-Order Component (HOC) version of AdminRoute
 * Useful for wrapping page components
 */
export function withAdminProtection<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function AdminProtectedComponent(props: P) {
        return (
            <AdminRoute>
                <Component {...props} />
            </AdminRoute>
        );
    };
}
