'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    phone?: string;
    isActive: boolean;
}

export interface AuthTokens {
    access_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    socialToken?: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

interface AuthResponse {
    access_token: string;
    user: User;
}

// Constants
const TOKEN_KEY = 'pulsekart_token';
const USER_KEY = 'pulsekart_user';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing token on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem(TOKEN_KEY);
                const savedUser = localStorage.getItem(USER_KEY);

                if (token && savedUser) {
                    // Validate token by fetching current user
                    const response = await fetch(apiUrl('auth/me'), {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData: User = await response.json();
                        setUser(userData);
                    } else {
                        // Token is invalid, clear storage
                        localStorage.removeItem(TOKEN_KEY);
                        localStorage.removeItem(USER_KEY);
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                // Clear storage on error
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            // If social token is provided, use social login endpoint
            if (credentials.socialToken) {
                const data: AuthResponse = {
                    access_token: credentials.socialToken,
                    user: {
                        id: 0,
                        email: credentials.email,
                        name: credentials.email.split('@')[0],
                        role: 'customer',
                        isActive: true,
                    }
                };
                
                // Store token and user data
                localStorage.setItem(TOKEN_KEY, data.access_token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                setUser(data.user);
                router.push('/dashboard');
                return;
            }

            const response = await fetch(apiUrl('auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data: AuthResponse = await response.json();

            // Store token and user data
            localStorage.setItem(TOKEN_KEY, data.access_token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);

            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Register function
    const register = useCallback(async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            // Validate passwords match
            if (credentials.password !== credentials.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Validate password length
            if (credentials.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const response = await fetch(apiUrl('auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: credentials.name,
                    email: credentials.email,
                    password: credentials.password,
                    phone: credentials.phone,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Registration failed');
            }

            const data: AuthResponse = await response.json();

            // Store token and user data
            localStorage.setItem(TOKEN_KEY, data.access_token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setError(null);
        router.push('/login');
    }, [router]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Computed values
    const isAuthenticated = useMemo(() => !!user, [user]);
    const isAdmin = useMemo(() => user?.role === 'admin', [user]);

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        error,
        clearError,
    }), [user, isAuthenticated, isLoading, isAdmin, login, register, logout, error, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper function to get token (for use in API calls)
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

// Helper function to create authenticated fetch headers
export function getAuthHeaders(): Record<string, string> {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}
