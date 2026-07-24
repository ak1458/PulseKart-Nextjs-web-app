'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Package, Clock, X, RefreshCw, MapPin, CreditCard } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyOrders, type CustomerOrder } from '@/lib/checkout-api';

const FILTERS = ['All', 'Delivered', 'In Progress', 'Cancelled', 'Rx Pending'];

export default function OrdersPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

    // Real orders. This was a module-level `const ORDERS: any[] = []` under a
    // comment claiming they were "loaded from the backend" - nothing fetched
    // anything, and no endpoint existed to fetch from until GET /v1/orders/mine.
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchMyOrders()
            .then(result => { if (!cancelled) setOrders(result); })
            .catch((err: Error) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, []);

    const filteredOrders = activeFilter === 'All'
        ? orders
        : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());

    const hasOrders = orders.length > 0;
    const hasFilteredOrders = filteredOrders.length > 0;

    return (
        <div className="animate-fade-in relative min-h-screen">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-white">My Orders</h1>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                                : 'glass-panel text-gray-300 hover:text-white border border-white/10'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {hasFilteredOrders ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            layoutId={`order-${order.id}`}
                            onClick={() => setSelectedOrder(order)}
                            className="glass-panel rounded-2xl border border-white/10 p-6 hover:border-teal-500/30 transition-all cursor-pointer group"
                            whileHover={{ y: -2 }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Left: Info & Thumbnails */}
                                <div className="flex items-start gap-4">
                                    <div className="flex -space-x-4">
                                        {order.items.map((item: any, i: number) => (
                                            <div key={i} className="w-16 h-16 rounded-xl border-2 border-[#030712] shadow-sm overflow-hidden bg-white/5 relative z-10">
                                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-white">{order.id}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                    order.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/10 text-gray-400 border border-white/10'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{order.date} • {order.items.length} Items</p>
                                    </div>
                                </div>

                                {/* Right: Price & Actions */}
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                                        <p className="text-lg font-bold text-white">₹{order.total}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                                            onClick={(e) => { e.stopPropagation(); /* Add reorder logic */ }}
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                        <button className="px-4 py-2 bg-teal-500/20 text-teal-300 text-sm font-bold rounded-lg hover:bg-teal-500/30 transition-colors border border-teal-500/30">
                                            Track
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <Package className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        {isLoading ? 'Loading your orders…' : error ? 'Could not load your orders' : hasOrders ? 'No orders in this view' : 'No orders yet'}
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        {isLoading ? 'One moment.' : error ? error : hasOrders ? 'Try another filter or check back later.' : 'Start shopping to place your first order.'}
                    </p>
                    {hasOrders ? (
                        <button
                            onClick={() => setActiveFilter('All')}
                            className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-colors"
                        >
                            View All Orders
                        </button>
                    ) : (
                        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white text-sm font-bold">
                            Start Shopping <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            )}

            {/* Slide-in Details Panel */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`order-${selectedOrder.id}`}
                            className="fixed inset-y-0 right-0 w-full md:w-[480px] glass-dock z-50 shadow-2xl overflow-y-auto border-l border-white/10"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-white">Order Details</h2>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                {/* Order Summary */}
                                <div className="glass-panel rounded-2xl p-4 mb-8 border border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-white text-lg">{selectedOrder.id}</p>
                                            <p className="text-sm text-gray-400">{selectedOrder.items.length} Items • ₹{selectedOrder.total}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedOrder.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3 glass-panel p-2 rounded-xl border border-white/10">
                                                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold text-white">₹{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-teal-400" /> Order Timeline
                                    </h3>
                                    <div className="relative pl-4 border-l-2 border-white/10 space-y-8">
                                        {selectedOrder.timeline.map((step: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${step.completed ? 'bg-teal-500 border-teal-500' : 'bg-[#030712] border-white/20'
                                                    }`}></div>
                                                <p className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-gray-500'}`}>{step.status}</p>
                                                <p className="text-xs text-gray-500">{step.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery & Payment Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-teal-400" /> Delivery Address
                                        </h3>
                                        <p className="text-sm text-gray-300 leading-relaxed glass-panel p-3 rounded-xl border border-white/10">
                                            {selectedOrder.address}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-teal-400" /> Payment Info
                                        </h3>
                                        <div className="glass-panel p-3 rounded-xl flex justify-between items-center border border-white/10">
                                            <span className="text-sm text-gray-300">{selectedOrder.payment}</span>
                                            <span className="text-sm font-bold text-white">₹{selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Bottom Actions */}
                                <div className="sticky bottom-0 mt-8 pt-4 bg-[#030712]/80 backdrop-blur-md border-t border-white/10 flex gap-3">
                                    <button className="flex-1 py-3 rounded-xl border border-teal-500/50 text-teal-300 font-bold hover:bg-teal-500/10 transition-colors">
                                        Download Invoice
                                    </button>
                                    <button className="flex-1 py-3 rounded-xl btn-gradient text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                                        Track Order
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
