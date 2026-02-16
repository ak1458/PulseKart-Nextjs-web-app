'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, AlertTriangle, Package, Camera, Save } from '@/lib/icons';

export default function InspectionPage() {
    const [returnId, setReturnId] = useState('');
    const [activeReturn, setActiveReturn] = useState<any>(null);
    const [inspectionData, setInspectionData] = useState<any>({});

    const handleSearch = async () => {
        try {
            const res = await fetch(`/api/v1/returns/${returnId}`);
            if (res.ok) {
                const data = await res.json();
                setActiveReturn(data);
            } else {
                alert('Return ID not found');
                setActiveReturn(null);
            }
        } catch (error) {
            console.error('Failed to fetch return:', error);
            alert('Failed to fetch return data');
            setActiveReturn(null);
        }
    };

    const handleSubmit = async (outcome: string) => {
        console.log('Submitting inspection:', { returnId, outcome, inspectionData });
        alert(`Inspection submitted: ${outcome.toUpperCase()}`);
        setActiveReturn(null);
        setReturnId('');
        setInspectionData({});
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-teal-600" />
                Return Inspection
            </h1>

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scan or Enter Return ID</label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={returnId}
                            onChange={(e) => setReturnId(e.target.value)}
                            placeholder="e.g., RET-2025-XXXX"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Fetch
                    </button>
                </div>
            </div>

            {/* Inspection Form */}
            {activeReturn && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{activeReturn.id}</h2>
                                <p className="text-sm text-gray-500">Order: {activeReturn.order_id} • Customer: {activeReturn.user.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                Pending Inspection
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Items List */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Items to Inspect</h3>
                            <div className="space-y-4">
                                {activeReturn.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} • Claimed: {item.condition}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Evidence Upload */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Evidence</h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-colors cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to capture or upload photos</p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24"
                                placeholder="Describe condition, reason for rejection, etc."
                                onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleSubmit('reject')}
                                className="flex items-center justify-center gap-2 py-3 border border-red-200 text-red-700 rounded-xl hover:bg-red-50 font-medium transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject Return
                            </button>
                            <button
                                onClick={() => handleSubmit('accept')}
                                className="flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold transition-colors shadow-lg shadow-teal-200"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve & Restock
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

