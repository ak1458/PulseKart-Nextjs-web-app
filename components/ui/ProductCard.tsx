'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { Heart, Plus, ImageOff, Star, Eye, Zap, Award } from '@/lib/icons';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { getProductImage } from '@/lib/images';
import { sanitizeHtml } from '@/lib/sanitize';

// Product type definition
export interface Product {
    id: string | number;
    title?: string;
    name?: string;
    category?: string;
    price: number;
    finalPrice?: number;
    mrp?: number;
    image?: string;
    images?: string[];
    description?: string;
    shortDesc?: string;
    rating?: number;
    reviewCount?: number;
    isExpress?: boolean;
    attributes?: Record<string, unknown>;
}

interface ProductCardProps {
    product: Product;
}

// Safe number formatter
const safeNumber = (value: unknown, defaultValue = 0): number => {
    if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
};

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Safe data extraction
    const title = sanitizeHtml(product.title || product.name || 'Untitled Product');
    const price = safeNumber(product.finalPrice, safeNumber(product.price));
    const originalPrice = product.finalPrice ? safeNumber(product.price) : undefined;
    const image = getProductImage(product.images?.[0] || product.image || '');
    const description = sanitizeHtml(product.shortDesc || product.description || '');
    const rating = safeNumber(product.rating);
    const reviewCount = safeNumber(product.reviewCount);
    const isBestseller = rating >= 4.5 && reviewCount > 100;

    const handleAddToCart = useCallback(async () => {
        if (isAddingToCart) return;

        setIsAddingToCart(true);
        try {
            await addToCart({
                id: Number(product.id) || 0,
                name: title,
                price: price,
                image: image,
                category: product.category,
                mrp: originalPrice,
            });
        } finally {
            // Reset after animation
            setTimeout(() => setIsAddingToCart(false), 500);
        }
    }, [addToCart, product, title, price, image, originalPrice, isAddingToCart]);

    // Don't render if essential data is missing
    if (!product.id || price <= 0) {
        return null;
    }

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="glass-panel rounded-3xl p-5 flex flex-col group h-full relative overflow-hidden transition-all duration-500 hover:border-teal-500/30 hover:shadow-[0_0_50px_rgba(20,184,166,0.2)]"
        >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-700 pointer-events-none ${isHovered ? 'opacity-100' : ''}`} />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isExpress && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-lg shadow-orange-500/30 flex items-center gap-1.5 backdrop-blur-md border border-white/20">
                        <Zap className="w-3 h-3 fill-current" /> Express
                    </div>
                )}
                {isBestseller && (
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-lg shadow-violet-500/30 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                        <Award className="w-3 h-3" /> Bestseller
                    </div>
                )}
            </div>

            {/* Wishlist Button */}
            <button
                className="absolute top-4 right-4 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-gray-300 hover:text-red-400 hover:bg-red-500/20 shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-500 border border-white/10 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                aria-label="Add to wishlist"
                onClick={(e) => e.preventDefault()}
            >
                <Heart className="w-4 h-4" />
            </button>

            {/* Image Section */}
            <div className="relative h-56 mb-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-8 group-hover:from-white/15 group-hover:to-white/10 transition-all duration-500 border border-white/5">
                {!imageError && image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                        onError={() => setImageError(true)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <ImageOff className="w-12 h-12 mb-2 opacity-40" />
                        <span className="text-xs font-medium opacity-60">No Image</span>
                    </div>
                )}

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center pointer-events-none">
                    <Link
                        href={`/product/${product.id}`}
                        className="btn-gradient text-white px-6 py-3 rounded-full text-xs font-bold shadow-xl transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 pointer-events-auto hover:scale-105"
                    >
                        <Eye className="w-4 h-4" /> Quick View
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col relative z-10">
                {product.category && (
                    <p className="text-[10px] font-bold text-teal-300/80 uppercase tracking-[0.2em] mb-2">
                        {sanitizeHtml(product.category)}
                    </p>
                )}
                <h3
                    className="font-bold text-white text-base mb-2 line-clamp-2 leading-snug group-hover:text-teal-200 transition-colors duration-300"
                    dangerouslySetInnerHTML={{ __html: title }}
                />

                {/* Rating */}
                {rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold text-yellow-300 border border-yellow-500/20">
                            {rating.toFixed(1)} <Star className="w-3 h-3 ml-1 fill-current icon-glow" />
                        </div>
                        {reviewCount > 0 && (
                            <span className="text-xs text-gray-400 font-medium">({reviewCount})</span>
                        )}
                    </div>
                )}

                {description && (
                    <p
                        className="text-xs text-gray-400/80 mb-4 line-clamp-2 leading-relaxed font-light"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white tracking-tight">₹{price.toFixed(2)}</span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-xs text-gray-500 line-through font-medium">
                                ₹{originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center hover:from-teal-500 hover:to-emerald-500 hover:text-white hover:border-teal-400 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] active:scale-90 group/btn disabled:opacity-50"
                        aria-label="Add to cart"
                    >
                        {isAddingToCart ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
