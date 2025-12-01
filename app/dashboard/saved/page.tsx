'use client';

import React from 'react';
import { Heart, ShoppingCart, Star, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SAVED_ITEMS = [
    {
        id: 1,
        name: "Dolo 650mg Tablet",
        strength: "15 Tablets",
        price: 30,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        inStock: true,
        rating: 4.8
    },
    {
        id: 4,
        name: "Pampers Active Baby (L)",
        strength: "Pack of 50",
        price: 399,
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
        inStock: true,
        rating: 4.9
    },
    {
        id: 6,
        name: "Multivitamin Gold Daily",
        strength: "60 Capsules",
        price: 349,
        image: "https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=400&h=400&fit=crop",
        inStock: false,
        rating: 4.5
    }
];

const SUGGESTIONS = [
    {
        id: 7,
        name: "Cetaphil Gentle Cleanser",
        price: 450,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        name: "Digital Thermometer",
        price: 299,
        image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=400&fit=crop"
    }
];

export default function SavedItemsPage() {
    return (
        <div className="animate-fade-in pb-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Saved Items</h1>

            {/* Saved Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {SAVED_ITEMS.map((item) => (
                    <motion.div
                        key={item.id}
                        layoutId={`saved-${item.id}`}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group relative"
                        whileHover={{ y: -4 }}
                    >
                        <div className="relative h-48 bg-gray-50 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {!item.inStock && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.strength}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" /> {item.rating}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                                <button
                                    disabled={!item.inStock}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${item.inStock
                                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Similar to your saved list</h2>
                        <p className="text-sm text-indigo-600">Based on your preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SUGGESTIONS.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <div className="h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                            <p className="text-teal-600 font-bold text-sm">₹{item.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Sticky Checkout (Mock) */}
            <div className="lg:hidden fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-30">
                <div>
                    <p className="text-xs text-gray-400">Total Saved Value</p>
                    <p className="font-bold text-lg">₹778</p>
                </div>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-xl font-bold text-sm">
                    Buy All
                </button>
            </div>
        </div>
    );
}
