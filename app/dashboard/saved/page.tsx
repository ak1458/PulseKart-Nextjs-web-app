'use client';

import React from 'react';
import { Heart, ShoppingCart, Star, Trash2, TrendingUp } from '@/lib/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Saved items are loaded from the backend. Keep empty for a clean client-ready view.
const SAVED_ITEMS: any[] = [];
const SUGGESTIONS: any[] = [];

export default function SavedItemsPage() {
    return (
        <div className="animate-fade-in pb-24">
            <h1 className="text-2xl font-bold text-white mb-8">Saved Items</h1>

            {SAVED_ITEMS.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                        <Heart className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No saved items yet</h2>
                    <p className="text-sm text-gray-400 mb-6">Save products to compare and buy later.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <>
                    {/* Saved Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {SAVED_ITEMS.map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={`saved-${item.id}`}
                                className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all group relative"
                                whileHover={{ y: -4 }}
                            >
                                <div className="relative h-48 bg-white/5 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500/20 transition-colors border border-white/10">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {!item.inStock && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-white line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-gray-400">{item.strength}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-300 text-xs font-bold border border-yellow-500/30">
                                            <Star className="w-3 h-3 fill-current" /> {item.rating}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-white">₹{item.price}</span>
                                        <button
                                            disabled={!item.inStock}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${item.inStock
                                                    ? 'btn-gradient text-white hover:shadow-lg hover:shadow-teal-500/30'
                                                    : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                                }`}
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Smart Suggestions */}
                    {SUGGESTIONS.length > 0 && (
                        <div className="glass-panel rounded-3xl p-8 border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
                                    <TrendingUp className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Similar to your saved list</h2>
                                    <p className="text-sm text-teal-400">Based on your preferences</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {SUGGESTIONS.map((item) => (
                                    <div key={item.id} className="glass-panel p-4 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer group">
                                        <div className="h-32 bg-white/5 rounded-lg mb-3 overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm mb-1 truncate">{item.name}</h3>
                                        <p className="text-teal-400 font-bold text-sm">₹{item.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
