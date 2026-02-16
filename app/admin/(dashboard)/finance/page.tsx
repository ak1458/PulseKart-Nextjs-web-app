'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from '@/lib/icons';

export default function AdminFinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/v1/finance/dashboard');
            if (res.ok) {
                const json = await res.json();
                if (json && json.stats) {
                    setData(json);
                    return;
                }
            }
            throw new Error('API not available');
        } catch (error) {
            console.log('API not available, using empty data');
            setData({
                stats: {
                    total_revenue: 0,
                    pending_settlement: 0,
                    total_refunds: 0
                },
                transactions: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse text-gray-500">
            <CreditCard className="w-6 h-6 mr-2 opacity-50" />
            Loading finance data...
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-400" />
                Finance & Reconciliation
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-white mt-1">₹{data?.stats.total_revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl group-hover:bg-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-400 font-medium relative z-10">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+12.5% from last month</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Pending Settlements</p>
                            <h3 className="text-3xl font-bold text-white mt-1">₹{data?.stats.pending_settlement.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl group-hover:bg-orange-500/20 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-400 font-medium relative z-10">
                        <span>Requires attention</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Total Refunds</p>
                            <h3 className="text-3xl font-bold text-white mt-1">₹{data?.stats.total_refunds.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl group-hover:bg-red-500/20 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400 font-medium relative z-10">
                        <span>Processed successfully</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data?.transactions.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                            ) : (
                                data?.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{tx.order_id}</td>
                                        <td className="px-6 py-4 text-gray-300 group-hover:text-white transition-colors">{tx.customer_name || 'Guest'}</td>
                                        <td className="px-6 py-4 capitalize text-gray-400">{tx.method}</td>
                                        <td className="px-6 py-4 font-bold text-white">₹{parseFloat(tx.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tx.status === 'captured' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                tx.status === 'authorized' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    tx.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-white/5 text-gray-400 border-white/10'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

