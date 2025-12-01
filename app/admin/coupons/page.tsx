'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Calendar, Percent, IndianRupee, Trash2 } from 'lucide-react';
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
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            console.error('Failed to fetch coupons', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    value: parseFloat(formData.value),
                    min_order_amount: parseFloat(formData.min_order_amount),
                    usage_limit_total: parseInt(formData.usage_limit_total)
                })
            });

            if (res.ok) {
                alert('Coupon created successfully!');
                setIsModalOpen(false);
                fetchCoupons();
                setFormData({
                    code: '',
                    type: 'percent',
                    value: '',
                    min_order_amount: '',
                    start_at: '',
                    end_at: '',
                    usage_limit_total: ''
                });
            } else {
                alert('Failed to create coupon');
            }
        } catch (error) {
            console.error('Create error:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`/api/v1/coupons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Coupon deleted successfully');
                fetchCoupons();
            } else {
                alert('Failed to delete coupon');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coupons & Promotions</h1>
                    <p className="text-gray-500 text-sm">Manage discount codes and offers</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-200"
                >
                    <Plus className="w-4 h-4" /> Create Coupon
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tag className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Coupons</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Create discount codes and promotional offers to boost sales.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{coupon.code}</h3>
                                    <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span className="font-bold text-gray-900">
                                        {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Min Order:</span>
                                    <span className="font-medium">₹{coupon.min_order_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span className="font-medium">{new Date(coupon.end_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Create New Coupon</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase font-mono"
                                        placeholder="SUMMER2024"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        >
                                            <option value="percent">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="20"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Min Order (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.min_order_amount}
                                            onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit_total}
                                            onChange={e => setFormData({ ...formData, usage_limit_total: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.start_at}
                                            onChange={e => setFormData({ ...formData, start_at: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.end_at}
                                            onChange={e => setFormData({ ...formData, end_at: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200"
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
