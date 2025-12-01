'use client';

import React, { useState } from 'react';
import { Heart, Plus, ImageOff, Star, Eye, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export type Product = {
    id: string | number;
    title?: string;
    name?: string;
    category?: string;
    price: number;
    finalPrice?: number;
    image?: string;
    images?: string[];
    description?: string;
    shortDesc?: string;
    rating?: string | number;
    reviewCount?: number;
    isExpress?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [imageError, setImageError] = useState(false);

    const title = product.title || product.name || 'Untitled Product';
    const price = product.finalPrice || product.price;
    const originalPrice = product.finalPrice ? product.price : undefined;
    const image = product.images?.[0] || product.image || '';
    const description = product.shortDesc || product.description;
    const rating = parseFloat(String(product.rating || 0));
    const isBestseller = rating >= 4.5 && (product.reviewCount || 0) > 100;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-3 flex flex-col group h-full relative overflow-hidden"
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.isExpress && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm flex items-center gap-1">
                        ⚡ Express
                    </div>
                )}
                {isBestseller && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm">
                        🏆 Bestseller
                    </div>
                )}
            </div>

            {/* Wishlist Button */}
            <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300">
                <Heart className="w-4 h-4" />
            </button>

            {/* Image Section */}
            <div className="relative h-48 mb-3 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                {!imageError && image ? (
                    <img
                        src={image}
                        alt={title}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                        <ImageOff className="w-12 h-12 mb-2" />
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 pointer-events-auto hover:bg-teal-50 hover:text-teal-600">
                        <Eye className="w-3 h-3" /> Quick View
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col px-1">
                {product.category && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {product.category}
                    </p>
                )}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">
                    {title}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center bg-green-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700">
                            {product.rating} <Star className="w-3 h-3 ml-0.5 fill-current" />
                        </div>
                        <span className="text-xs text-gray-400">({product.reviewCount || 0} reviews)</span>
                    </div>
                )}

                {description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">₹{price}</span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                        )}
                    </div>
                    <button
                        onClick={() => addToCart({ ...product, name: title, price: price, image: image })}
                        className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:shadow-teal-200 active:scale-95 group/btn"
                    >
                        <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
