'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Calendar, Percent, IndianRupee, Trash2, Check, X } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        value: '',
        min_order_amount: '',
        start_at: '',
        end_at: '',
        usage_limit_total: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/v1/coupons');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCoupons(data);
                    return;
                }
            }
            throw new Error('API invalid');
        } catch (error) {
            console.log('Failed to fetch coupons', error);
            setCoupons([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        const newCoupon = {
            id: Date.now(),
            ...formData,
            value: parseFloat(formData.value),
            min_order_amount: parseFloat(formData.min_order_amount),
            usage_limit_total: parseInt(formData.usage_limit_total),
            status: 'active'
        };
        setCoupons([newCoupon, ...coupons]);
        setIsModalOpen(false);
        setFormData({
            code: '', type: 'percent', value: '', min_order_amount: '', start_at: '', end_at: '', usage_limit_total: ''
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        setCoupons(coupons.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tag className="w-6 h-6 text-teal-400" />
                        Coupons & Promotions
                    </h1>
                    <p className="text-gray-400 text-sm">Manage discount codes and offers</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" /> Create Coupon
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                        <Tag className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Active Coupons</h2>
                    <p className="text-gray-400 max-w-md">
                        Create discount codes and promotional offers to boost sales.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg tracking-wide">{coupon.code}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {coupon.status === 'active' ? 'ACTIVE' : 'EXPIRED'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-400 relative z-10">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Discount:</span>
                                    <span className="font-bold text-white">
                                        {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Min Order:</span>
                                    <span className="font-medium text-gray-300">₹{coupon.min_order_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span className="font-medium text-gray-300">{new Date(coupon.end_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden bg-[#0A0A0A]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Create New Coupon</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase font-mono text-white placeholder-gray-600"
                                        placeholder="SUMMER2024"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white appearance-none"
                                        >
                                            <option value="percent">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Value</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                            placeholder="20"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Min Order (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.min_order_amount}
                                            onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                            placeholder="500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit_total}
                                            onChange={e => setFormData({ ...formData, usage_limit_total: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.start_at}
                                            onChange={e => setFormData({ ...formData, start_at: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.end_at}
                                            onChange={e => setFormData({ ...formData, end_at: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
                                    >
                                        Create Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

