'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, AlertTriangle, FileText, Zap, Clock, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPrescriptionsPage() {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoCapture, setAutoCapture] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/v1/prescriptions');
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (error) {
            console.error('Failed to fetch queue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:4000/api/v1/prescriptions/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) fetchQueue();
        } catch (error) {
            console.error('Failed to approve:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:4000/api/v1/prescriptions/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });
            if (res.ok) fetchQueue();
        } catch (error) {
            console.error('Failed to reject:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this prescription request?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/v1/prescriptions/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchQueue();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const filteredQueue = queue.filter(rx => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return rx.status === 'awaiting_rx' || rx.status === 'rx_review';
        return rx.status === filterStatus;
    });

    const pendingCount = queue.filter(rx => rx.status === 'awaiting_rx' || rx.status === 'rx_review').length;

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Pharmacist Queue
                        {pendingCount > 0 && (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full animate-pulse">
                                {pendingCount} Pending
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm">Review incoming prescriptions</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <Zap className={`w-4 h-4 ${autoCapture ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-700">Auto-Capture</span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                        onClick={() => setAutoCapture(!autoCapture)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${autoCapture ? 'bg-teal-600' : 'bg-gray-200'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${autoCapture ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Queue List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading queue...</div>
                ) : filteredQueue.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No prescriptions found.</div>
                ) : (
                    <AnimatePresence>
                        {filteredQueue.map((rx) => (
                            <motion.div
                                layout
                                key={rx.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${(rx.status === 'awaiting_rx' || rx.status === 'rx_review') ? 'border-l-4 border-l-orange-500 shadow-md' : 'border-gray-100 opacity-75'
                                    }`}
                            >
                                <div className="p-4 md:p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                {rx.user ? rx.user.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{rx.user || 'Guest User'}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(rx.uploaded).toLocaleString()}
                                                    <span className="text-gray-300">•</span>
                                                    <span>{rx.items} items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${rx.risk_score > 50 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {rx.risk_score > 50 ? 'High Risk' : 'Normal'}
                                            </span>
                                            <span className="text-xs font-mono text-gray-400">{rx.id}</span>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    {(rx.status === 'awaiting_rx' || rx.status === 'rx_review') ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleReject(rx.id)}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 active:scale-95 transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(rx.id)}
                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all ${autoCapture
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-900/20'
                                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                                                    }`}
                                            >
                                                <Check className="w-5 h-5" />
                                                {autoCapture ? 'Approve & Capture' : 'Approve Only'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between py-2 px-1">
                                            <span className={`font-bold flex items-center gap-2 ${rx.status === 'payment_pending' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {rx.status === 'payment_pending' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                                {rx.status}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(rx.id)}
                                                className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
