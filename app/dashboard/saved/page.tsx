'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart, Trash2, AlertCircle } from '@/lib/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { fetchSavedItems, unsaveItem, type SavedItem } from '@/lib/saved-items-api';

/**
 * Saved items.
 *
 * This page was linked from three places in the dashboard but backed by
 * `const SAVED_ITEMS: any[] = []`, so it showed a permanent empty state. The
 * "Smart Suggestions" panel below it was driven by a second empty array and
 * captioned "Based on your preferences" - there is no recommendation engine, so
 * it has been removed rather than left as a promise the product cannot keep.
 */
export default function SavedItemsPage() {
    const { addToCart } = useCart();

    const [items, setItems] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setItems(await fetchSavedItems());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load your saved items.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function handleRemove(productId: number) {
        // Optimistic: the row disappears immediately and is restored if the
        // request fails, so the list never sits there looking unresponsive.
        const previous = items;
        setItems(current => current.filter(i => i.productId !== productId));
        try {
            await unsaveItem(productId);
        } catch (err) {
            setItems(previous);
            setError(err instanceof Error ? err.message : 'Could not remove this item.');
        }
    }

    return (
        <div className="animate-fade-in pb-24">
            <h1 className="text-2xl font-bold text-white mb-8">Saved Items</h1>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center text-gray-400">
                    Loading your saved items&hellip;
                </div>
            ) : items.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                        <Heart className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No saved items yet</h2>
                    <p className="text-sm text-gray-400 mb-6">Save products to compare and buy later.</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <motion.div
                            key={item.productId}
                            layout
                            className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all group relative"
                            whileHover={{ y: -4 }}
                        >
                            <div className="relative h-48 bg-white/5 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <button
                                    onClick={() => handleRemove(item.productId)}
                                    aria-label={`Remove ${item.name} from saved items`}
                                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500/20 transition-colors border border-white/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5">
                                <p className="text-xs text-gray-400 mb-1">{item.category}</p>
                                <h3 className="font-bold text-white line-clamp-1">{item.name}</h3>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-lg font-bold text-white">
                                        ₹{item.price.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => addToCart({
                                            id: item.productId,
                                            name: item.name,
                                            price: item.price,
                                            image: item.image,
                                            category: item.category,
                                            requiresPrescription: item.requiresPrescription,
                                        })}
                                        className="btn-gradient px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg hover:shadow-teal-500/30"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
