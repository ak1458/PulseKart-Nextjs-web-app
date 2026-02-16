'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, AlertTriangle, FileText, Zap, Clock, ChevronDown, Settings, Trash2 } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api';

export default function AdminPrescriptionsPage() {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoCapture, setAutoCapture] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const fetchQueue = async () => {
        try {
            const res = await fetch(apiUrl('prescriptions'));
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
            const res = await fetch(apiUrl(`prescriptions/${id}/review`), {
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
            const res = await fetch(apiUrl(`prescriptions/${id}/review`), {
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
            const res = await fetch(apiUrl(`prescriptions/${id}`), {
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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Pharmacist Queue
                        {pendingCount > 0 && (
                            <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                {pendingCount} Pending
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 text-sm">Review incoming prescriptions</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto glass-panel p-2 rounded-xl border border-white/10 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
                    <div className="flex items-center gap-2 px-2 relative z-10">
                        <Zap className={`w-4 h-4 ${autoCapture ? 'text-amber-400' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium text-gray-300">Auto-Capture</span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                        onClick={() => setAutoCapture(!autoCapture)}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ease-in-out relative z-10 border ${autoCapture ? 'bg-teal-500/20 border-teal-500/50' : 'bg-black/40 border-white/10'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${autoCapture ? 'translate-x-6 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'translate-x-0 bg-gray-400'
                            }`} />
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-1 relative z-10"></div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border-none bg-transparent focus:ring-0 text-gray-300 font-medium cursor-pointer relative z-10 focus:text-white"
                        style={{ colorScheme: 'dark' }}
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
                    <div className="glass-panel text-center py-20 text-gray-500 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                        <FileText className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
                        <p>No prescriptions found.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredQueue.map((rx) => (
                            <motion.div
                                layout
                                key={rx.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`glass-panel rounded-xl border shadow-lg overflow-hidden transition-all group relative ${(rx.status === 'awaiting_rx' || rx.status === 'rx_review') ? 'border-l-4 border-l-orange-500 shadow-orange-900/10' : 'border-white/5 opacity-75 hover:opacity-100'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                                <div className="p-4 md:p-5 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                                {rx.user ? rx.user.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">{rx.user || 'Guest User'}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(rx.uploaded).toLocaleString()}
                                                    <span className="text-gray-600">•</span>
                                                    <span>{rx.items} items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${rx.risk_score > 50 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {rx.risk_score > 50 ? 'High Risk' : 'Normal'}
                                            </span>
                                            <span className="text-xs font-mono text-gray-600">{rx.id}</span>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    {(rx.status === 'awaiting_rx' || rx.status === 'rx_review') ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleReject(rx.id)}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 active:scale-95 transition-all text-sm"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(rx.id)}
                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all text-sm ${autoCapture
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                                    }`}
                                            >
                                                <Check className="w-4 h-4" />
                                                {autoCapture ? 'Approve & Capture' : 'Approve Only'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between py-2 px-1">
                                            <span className={`font-bold flex items-center gap-2 ${rx.status === 'payment_pending' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {rx.status === 'payment_pending' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                                {rx.status}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(rx.id)}
                                                className="text-sm text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
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

