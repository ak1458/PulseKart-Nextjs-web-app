'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    // Mock Cart Data with more details
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Dolo 650mg Tablet",
            strength: "650mg",
            packSize: "Strip of 15",
            price: 30,
            mrp: 35,
            qty: 2,
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Paracetamol_tablets_and_packaging.jpg/800px-Paracetamol_tablets_and_packaging.jpg?20180226154106",
            isRx: false,
            inStock: true,
            isExpress: true
        },
        {
            id: 4,
            name: "Pampers Active Baby (L)",
            strength: "Large",
            packSize: "Pack of 50",
            price: 399,
            mrp: 599,
            qty: 1,
            image: "https://m.media-amazon.com/images/I/61N+R+Yq+lL._SX522_.jpg",
            isRx: false,
            inStock: true,
            isExpress: true
        }
    ]);

    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
    const [showCODModal, setShowCODModal] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const mrpTotal = cartItems.reduce((acc, item) => acc + (item.mrp * item.qty), 0);
    const shippingThreshold = 500;
    const shipping = subtotal >= shippingThreshold ? 0 : 40;

    // Payment Logic
    const codFee = paymentMethod === 'COD' ? 50 : 0;
    const prepaidDiscount = paymentMethod === 'PREPAID' ? Math.round(subtotal * 0.05) : 0;
    const couponDiscount = isCouponApplied ? Math.round(subtotal * 0.15) : 0;

    const total = subtotal + shipping + codFee - prepaidDiscount - couponDiscount;
    const totalSavings = (mrpTotal - subtotal) + prepaidDiscount + couponDiscount;

    const updateQty = (id: number, change: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + change);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleApplyCoupon = () => {
        if (coupon.toUpperCase() === 'NEW15') {
            setIsCouponApplied(true);
        }
    };

    const handlePaymentChange = (method: 'PREPAID' | 'COD') => {
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

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <ShoppingBag className="w-10 h-10 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our categories to find your essentials.</p>
                <Link href="/shop" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl">
                    Browse Medicines
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in relative">
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
                            <div className="text-6xl mb-4">😢</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Paying Cash? That's sad!</h3>
                            <p className="text-gray-500 mb-6">
                                COD orders incur a <span className="font-bold text-red-500">₹50 handling fee</span>.
                                <br />
                                Switch to Prepaid to save ₹50 + get <span className="font-bold text-green-600">EXTRA 5% OFF!</span> 🤑
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Your order is almost ready! Complete checkout to confirm.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                        <Zap className="w-3 h-3 fill-current" /> Express Delivery Available
                    </div>
                </div>

                {/* Free Delivery Bar */}
                {shipping > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-blue-700">Add items worth ₹{shippingThreshold - subtotal} more for FREE Delivery</span>
                                <span className="text-blue-500">{Math.round((subtotal / shippingThreshold) * 100)}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <Truck className="w-6 h-6 text-blue-500 hidden sm:block" />
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    <AnimatePresence>
                        {cartItems.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-full sm:w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 relative">
                                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                                    {item.isExpress && (
                                        <div className="absolute -top-2 -left-2 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded text-yellow-900 shadow-sm">
                                            ⚡ Express
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-1">{item.strength} • {item.packSize}</p>
                                            <div className="flex gap-2 mt-1">
                                                {item.isRx && (
                                                    <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                                                        Rx Required
                                                    </span>
                                                )}
                                                {item.inStock && (
                                                    <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> In Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-teal-700">₹{item.price}</span>
                                            <span className="text-xs text-gray-400 line-through">MRP ₹{item.mrp}</span>
                                        </div>

                                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                                            <button
                                                onClick={() => updateQty(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-teal-600 active:scale-95 transition-all"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-900">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-teal-600 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Smart Upsell */}
                    <div className="mt-8">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-teal-500" /> You may also need
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { name: "Digene Gel", price: 120, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80" },
                                { name: "ORS Pack", price: 40, img: "https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=200&q=80" },
                                { name: "Band-Aid", price: 30, img: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&q=80" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group">
                                    <img src={item.img} alt={item.name} className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-teal-600 font-bold mb-2">₹{item.price}</p>
                                    <button className="w-full py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-100 transition-colors">
                                        Add +
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Summary</h3>

                        {/* Payment Method Toggle */}
                        <div className="mb-6 bg-gray-50 p-1 rounded-xl flex">
                            <button
                                onClick={() => handlePaymentChange('PREPAID')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'PREPAID' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Prepaid (Save 5%)
                            </button>
                            <button
                                onClick={() => handlePaymentChange('COD')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'COD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Cash on Delivery
                            </button>
                        </div>

                        {/* Coupon */}
                        <div className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            {isCouponApplied && (
                                <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Coupon NEW15 applied!
                                </p>
                            )}
                            {!isCouponApplied && (
                                <p className="text-xs text-gray-400 mt-2">Try code <span className="font-bold text-gray-600">NEW15</span> for 15% off</p>
                            )}
                        </div>

                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Total MRP</span>
                                <span>₹{mrpTotal}</span>
                            </div>
                            <div className="flex justify-between text-green-600 text-sm font-medium">
                                <span>Discount on MRP</span>
                                <span>-₹{mrpTotal - subtotal}</span>
                            </div>
                            {isCouponApplied && (
                                <div className="flex justify-between text-green-600 text-sm font-medium">
                                    <span>Coupon Discount</span>
                                    <span>-₹{couponDiscount}</span>
                                </div>
                            )}
                            {paymentMethod === 'PREPAID' && (
                                <div className="flex justify-between text-green-600 text-sm font-medium">
                                    <span>Prepaid Discount (5%)</span>
                                    <span>-₹{prepaidDiscount}</span>
                                </div>
                            )}
                            {paymentMethod === 'COD' && (
                                <div className="flex justify-between text-red-500 text-sm font-medium">
                                    <span>COD Handling Fee</span>
                                    <span>+₹{codFee}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Delivery Charges</span>
                                <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                            <div className="text-right">
                                <span className="font-bold text-gray-900 text-2xl">₹{Math.round(total)}</span>
                                <p className="text-[10px] text-green-600 font-bold">You saved ₹{Math.round(totalSavings)} today!</p>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-2 mb-6 text-center">
                            <p className="text-xs text-green-800 font-medium">
                                Expected Delivery: <span className="font-bold">Today by 7:00 PM</span>
                            </p>
                        </div>

                        <Link href={`/checkout?method=${paymentMethod}`} className="block w-full">
                            <button className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-teal-200/50 transition-all active:scale-95 flex items-center justify-center gap-2 mb-4 animate-pulse-slow">
                                Checkout Securely <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>

                        <div className="flex items-center justify-center gap-4 text-gray-400 mb-4">
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs font-medium">UPI & Cards Accepted</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 bg-gray-50 py-2 rounded-lg">
                            <ShieldCheck className="w-3 h-3" />
                            100% Secure Payments • Easy Returns
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="mt-12 text-center border-t border-gray-100 pt-8">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    All orders are verified by certified pharmacists before dispatch.
                </div>
            </div>
        </div>
    );
}
