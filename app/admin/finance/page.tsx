'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminFinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/v1/finance/dashboard');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading finance data...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <h1 className="text-2xl font-bold text-gray-900">Finance & Reconciliation</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{data?.stats.total_revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+12.5% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Pending Settlements</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{data?.stats.pending_settlement.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                        <span>Requires attention</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Refunds</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{data?.stats.total_refunds.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                        <span>Processed successfully</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
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
                        <tbody className="divide-y divide-gray-100">
                            {data?.transactions.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                            ) : (
                                data?.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{tx.order_id}</td>
                                        <td className="px-6 py-4 text-gray-600">{tx.customer_name || 'Guest'}</td>
                                        <td className="px-6 py-4 capitalize">{tx.method}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">₹{parseFloat(tx.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === 'captured' ? 'bg-green-100 text-green-700' :
                                                    tx.status === 'authorized' ? 'bg-blue-100 text-blue-700' :
                                                        tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
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
