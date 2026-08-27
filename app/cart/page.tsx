'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Trash2,
    ArrowRight,
    Plus,
    Minus,
    ShieldCheck,
    Truck,
    Zap,
    Tag,
    CreditCard,
    AlertCircle,
    ShoppingBag,
    CheckCircle
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/lib/images';
import { PRICING_COPY } from '@/lib/constants';
import { safeNumber } from '@/lib/utils';

export default function CartPage() {
    const { cart, updateQty, removeFromCart, cartTotal } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
    const [showCODModal, setShowCODModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // The cart is a preview. Fees, discounts and the payable total are computed
    // by the server at checkout (POST /v1/orders/quote) and shown there.
    //
    // This block used to re-implement the pricing rules a third time - after
    // lib/constants.ts and the checkout page - and disagreed with both: it
    // stacked the prepaid and coupon discounts, where checkout applied only one.
    // The drift was visible in this component's own markup, which announced
    // "NEW15 applied (10% off)" two lines above advertising NEW15 as 15% off.
    const calculations = useMemo(() => {
        const subtotal = safeNumber(cartTotal);
        const mrpTotal = cart.reduce((acc, item) => {
            const mrp = safeNumber((item as { mrp?: number }).mrp, item.price);
            const qty = safeNumber(item.qty);
            return acc + (mrp * qty);
        }, 0);

        return {
            subtotal,
            mrpTotal,
            /** Savings against MRP only - a fact about the catalogue, not a quote. */
            catalogueSavings: Math.max(0, mrpTotal - subtotal),
            qualifiesForFreeDelivery: subtotal >= PRICING_COPY.FREE_DELIVERY_THRESHOLD_INR,
        };
    }, [cart, cartTotal]);

    const handlePaymentChange = (method: 'PREPAID' | 'COD') => {
        setError(null);
        if (method === 'COD') {
            setShowCODModal(true);
        } else {
            setPaymentMethod('PREPAID');
        }
    };

    const confirmCOD = () => {
        setPaymentMethod('COD');
        setShowCODModal(false);
    };

    const handleQuantityUpdate = (id: number, delta: number) => {
        setError(null);
        updateQty(id, delta);
    };

    const handleRemove = (id: number) => {
        setError(null);
        removeFromCart(id);
    };

    // Empty cart state
    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce border border-teal-500/20">
                    <ShoppingBag className="w-10 h-10 text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-8 max-w-md">Looks like you haven&apos;t added anything to your cart yet. Browse our categories to find your essentials.</p>
                <Link href="/shop" className="px-8 py-3 btn-gradient text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in relative">
            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-sm hover:underline">Dismiss</button>
                </div>
            )}

            {/* COD Warning Modal */}
            <AnimatePresence>
                {showCODModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Paying Cash? That&apos;s sad!</h3>
                            <p className="text-gray-500 mb-6">
                                COD orders incur a <span className="font-bold text-red-500">₹{PRICING_COPY.COD_FEE_INR} handling fee</span>.
                                <br />
                                Switch to Prepaid to save ₹{PRICING_COPY.COD_FEE_INR} + get <span className="font-bold text-green-600">EXTRA {PRICING_COPY.UPI_DISCOUNT_PERCENT}% OFF!</span>
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { setPaymentMethod('PREPAID'); setShowCODModal(false); }}
                                    className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                                >
                                    Switch to Prepaid & Save
                                </button>
                                <button
                                    onClick={confirmCOD}
                                    className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Continue with COD (Pay Extra)
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Area */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-display">Shopping Cart</h1>
                        <p className="text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">
                        <Zap className="w-3 h-3 fill-current" /> Express Delivery Available
                    </div>
                </div>

                {/* Free Delivery Bar */}
                {!calculations.qualifiesForFreeDelivery && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-blue-400">Add items worth ₹{PRICING_COPY.FREE_DELIVERY_THRESHOLD_INR - calculations.subtotal} more for FREE Delivery</span>
                                <span className="text-blue-400">{Math.round((calculations.subtotal / PRICING_COPY.FREE_DELIVERY_THRESHOLD_INR) * 100)}%</span>
                            </div>
                            <div className="w-full bg-blue-500/20 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${Math.min(100, (calculations.subtotal / PRICING_COPY.FREE_DELIVERY_THRESHOLD_INR) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <Truck className="w-6 h-6 text-blue-400 hidden sm:block" />
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {cart.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 glass-panel rounded-2xl border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="w-full sm:w-24 h-24 bg-white/5 rounded-xl flex items-center justify-center p-2 relative border border-white/5">
                                    <img
                                        src={getProductImage(item.image)}
                                        alt={item.name}
                                        className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/product-placeholder.svg';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-400 mb-1">{item.category || 'Product'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-gray-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-teal-400">₹{safeNumber(item.price, 0).toFixed(2)}</span>
                                            {(item as { mrp?: number }).mrp && (item as { mrp?: number }).mrp! > item.price && (
                                                <span className="text-xs text-gray-500 line-through">
                                                    ₹{safeNumber((item as { mrp?: number }).mrp, 0).toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                                            <button
                                                onClick={() => handleQuantityUpdate(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-white">{safeNumber(item.qty, 0)}</span>
                                            <button
                                                onClick={() => handleQuantityUpdate(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 sticky top-[var(--sticky-offset)]">
                        <h3 className="font-bold text-white mb-6 text-lg">Order Summary</h3>

                        {/* Payment Method Toggle */}
                        <div className="mb-6 bg-black/20 p-1 rounded-xl flex border border-white/5">
                            <button
                                onClick={() => handlePaymentChange('PREPAID')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'PREPAID' ? 'bg-teal-500/20 text-teal-300 shadow-sm border border-teal-500/30' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Prepaid (Save {PRICING_COPY.UPI_DISCOUNT_PERCENT}%)
                            </button>
                            <button
                                onClick={() => handlePaymentChange('COD')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'COD' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Cash on Delivery
                            </button>
                        </div>

                        <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>Subtotal</span>
                                <span>₹{calculations.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>Delivery Charges</span>
                                <span className={calculations.qualifiesForFreeDelivery ? "text-emerald-400 font-bold" : ""}>
                                    {calculations.qualifiesForFreeDelivery ? "FREE" : 'Calculated at checkout'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-white text-lg">Subtotal</span>
                            <div className="text-right">
                                <span className="font-bold text-white text-2xl">₹{calculations.subtotal.toFixed(2)}</span>
                                {calculations.catalogueSavings > 0 && (
                                    <p className="text-[10px] text-emerald-400 font-bold">You save ₹{calculations.catalogueSavings.toFixed(2)} vs MRP</p>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                            Coupons, payment discounts and delivery charges are applied at checkout.
                        </p>

                        <div className="bg-emerald-500/10 rounded-lg p-2 mb-6 text-center border border-emerald-500/20">
                            <p className="text-xs text-emerald-300 font-medium">
                                Expected Delivery: <span className="font-bold">Today by 7:00 PM</span>
                            </p>
                        </div>

                        <Link href={`/checkout?method=${paymentMethod === 'COD' ? 'COD' : 'UPI'}`} className="block w-full">
                            <button className="w-full btn-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mb-4">
                                Checkout Securely <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>

                        <div className="flex items-center justify-center gap-4 text-gray-500 mb-4">
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs font-medium">UPI & Cards Accepted</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 bg-white/5 py-2 rounded-lg border border-white/5">
                            <ShieldCheck className="w-3 h-3" />
                            100% Secure Payments • Easy Returns
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="mt-12 text-center border-t border-white/10 pt-8">
                <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <AlertCircle className="w-4 h-4" />
                    All orders are verified by certified pharmacists before dispatch.
                </div>
            </div>
        </div>
    );
}
