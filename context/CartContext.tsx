'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Properly typed Cart Item
export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    qty: number;
    category?: string;
    mrp?: number;
    requiresPrescription?: boolean;
}

// Product interface for adding to cart
export interface ProductInput {
    id: number | string;
    name?: string;
    title?: string;
    price: number | string;
    image?: string;
    category?: string;
    mrp?: number;
    images?: string[];
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: ProductInput) => void;
    removeFromCart: (id: number) => void;
    updateQty: (id: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    isLoading: boolean;
    error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Safe number parsing helper
const safeNumber = (value: unknown, defaultValue = 0): number => {
    if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('pulsekart_cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    // Validate and sanitize cart data
                    const validCart = parsed.filter((item): item is CartItem =>
                        item &&
                        typeof item.id === 'number' &&
                        typeof item.name === 'string' &&
                        typeof item.price === 'number' &&
                        !isNaN(item.price) &&
                        typeof item.qty === 'number' &&
                        !isNaN(item.qty) &&
                        item.qty > 0
                    );
                    setCart(validCart);
                }
            }
        } catch (e) {
            console.error('Failed to parse cart', e);
            setError('Failed to load cart');
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem('pulsekart_cart', JSON.stringify(cart));
            } catch (e) {
                console.error('Failed to save cart', e);
                setError('Failed to save cart');
            }
        }
    }, [cart, isInitialized]);

    const addToCart = useCallback((product: ProductInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const id = safeNumber(product.id, 0);
            if (id === 0) {
                throw new Error('Invalid product ID');
            }

            const price = safeNumber(product.price, 0);
            if (price <= 0) {
                throw new Error('Invalid product price');
            }

            const name = product.name || product.title || 'Unknown Product';
            const image = product.image || product.images?.[0] || '';

            setCart(prev => {
                const existing = prev.find(item => item.id === id);
                if (existing) {
                    return prev.map(item =>
                        item.id === id
                            ? { ...item, qty: item.qty + 1 }
                            : item
                    );
                }
                return [...prev, {
                    id,
                    name,
                    price,
                    image,
                    qty: 1,
                    category: product.category,
                    mrp: product.mrp,
                }];
            });
            setIsCartOpen(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
            console.error('Add to cart error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeFromCart = useCallback((id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateQty = useCallback((id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Memoized calculations to prevent recalculation on every render
    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price = safeNumber(item.price, 0);
            const qty = safeNumber(item.qty, 0);
            return sum + (price * qty);
        }, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + safeNumber(item.qty, 0), 0);
    }, [cart]);

    const value = useMemo(() => ({
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isLoading,
        error,
    }), [cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, isCartOpen, isLoading, error]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
