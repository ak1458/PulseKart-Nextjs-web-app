'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Package, Truck, CheckCircle, Clock, X, RefreshCw, MapPin, CreditCard, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Orders Data
const ORDERS = [
    {
        id: 'ORD-2024-156',
        date: 'Nov 29, 2024',
        status: 'Delivered',
        total: 1210,
        items: [
            { name: 'Dolo 650mg', quantity: 2, price: 60, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80' },
            { name: 'Multivitamin Gold', quantity: 1, price: 349, img: 'https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=100&q=80' }
        ],
        timeline: [
            { status: 'Order Placed', date: 'Nov 29, 10:00 AM', completed: true },
            { status: 'Verified', date: 'Nov 29, 10:15 AM', completed: true },
            { status: 'Packed', date: 'Nov 29, 11:00 AM', completed: true },
            { status: 'Out for Delivery', date: 'Nov 29, 02:00 PM', completed: true },
            { status: 'Delivered', date: 'Nov 29, 04:30 PM', completed: true }
        ],
        deliveryPerson: { name: 'Ramesh Kumar', phone: '9876543210' },
        address: '123, Green Valley, New Delhi',
        payment: 'UPI (PhonePe)'
    },
    {
        id: 'ORD-2024-158',
        date: 'Nov 30, 2024',
        status: 'In Progress',
        total: 850,
        items: [
            { name: 'Pampers Active Baby', quantity: 1, price: 799, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=100&q=80' }
        ],
        timeline: [
            { status: 'Order Placed', date: 'Nov 30, 09:00 AM', completed: true },
            { status: 'Verified', date: 'Nov 30, 09:10 AM', completed: true },
            { status: 'Packed', date: 'Nov 30, 10:30 AM', completed: true },
            { status: 'Out for Delivery', date: 'Expected 2:00 PM', completed: false },
            { status: 'Delivered', date: 'Expected 4:00 PM', completed: false }
        ],
        deliveryPerson: { name: 'Suresh Singh', phone: '9123456780' },
        address: 'Office No 4, Tech Park, Noida',
        payment: 'Cash on Delivery'
    }
];

const FILTERS = ['All', 'Delivered', 'In Progress', 'Cancelled', 'Rx Pending'];

export default function OrdersPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const filteredOrders = activeFilter === 'All'
        ? ORDERS
        : ORDERS.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());

    return (
        <div className="animate-fade-in relative min-h-screen">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <motion.div
                        key={order.id}
                        layoutId={`order-${order.id}`}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        whileHover={{ y: -2 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            {/* Left: Info & Thumbnails */}
                            <div className="flex items-start gap-4">
                                <div className="flex -space-x-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className="w-16 h-16 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-gray-50 relative z-10">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-gray-900">{order.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{order.date} • {order.items.length} Items</p>
                                </div>
                            </div>

                            {/* Right: Price & Actions */}
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); /* Add reorder logic */ }}
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button className="px-4 py-2 bg-teal-50 text-teal-700 text-sm font-bold rounded-lg hover:bg-teal-100 transition-colors">
                                        Track
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Slide-in Details Panel */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`order-${selectedOrder.id}`}
                            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 rounded-2xl p-4 mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{selectedOrder.id}</p>
                                            <p className="text-sm text-gray-500">{selectedOrder.items.length} Items • ₹{selectedOrder.total}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100">
                                                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-teal-600" /> Order Timeline
                                    </h3>
                                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                                        {selectedOrder.timeline.map((step: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${step.completed ? 'bg-teal-600 border-teal-600' : 'bg-white border-gray-300'
                                                    }`}></div>
                                                <p className={`text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</p>
                                                <p className="text-xs text-gray-500">{step.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery & Payment Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-teal-600" /> Delivery Address
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                                            {selectedOrder.address}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-teal-600" /> Payment Info
                                        </h3>
                                        <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{selectedOrder.payment}</span>
                                            <span className="text-sm font-bold text-gray-900">₹{selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Bottom Actions */}
                                <div className="sticky bottom-0 mt-8 pt-4 bg-white border-t border-gray-100 flex gap-3">
                                    <button className="flex-1 py-3 rounded-xl border border-teal-600 text-teal-600 font-bold hover:bg-teal-50 transition-colors">
                                        Download Invoice
                                    </button>
                                    <button className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
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
