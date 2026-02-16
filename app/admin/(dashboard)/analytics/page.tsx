'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, AlertCircle, BarChart2 } from '@/lib/icons';

// Empty data state for fresh install
const INITIAL_DATA = {
    metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        lowStockItems: 0
    },
    trend: [
        { date: 'Mon', value: 0 },
        { date: 'Tue', value: 0 },
        { date: 'Wed', value: 0 },
        { date: 'Thu', value: 0 },
        { date: 'Fri', value: 0 },
        { date: 'Sat', value: 0 },
        { date: 'Sun', value: 0 }
    ],
    distribution: [] as { name: string; value: number }[]
};

export default function AnalyticsDashboard() {
    const [data] = useState<any>(INITIAL_DATA);
    const [loading] = useState(false);

    if (loading) return <div className="p-8 text-center text-white">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-center text-white">Failed to load data.</div>;

    const { metrics, trend, distribution } = data;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold text-white mb-6">Business Intelligence</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white mt-1">₹{metrics.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-emerald-400 icon-glow" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1 relative z-10">
                        <span className="font-bold">+12.5%</span> from last month
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Orders</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <ShoppingCart className="w-5 h-5 text-blue-400 icon-glow" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-400 flex items-center gap-1 relative z-10">
                        <span className="font-bold">+5.2%</span> new orders
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Users</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalUsers}</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Users className="w-5 h-5 text-purple-400 icon-glow" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-purple-400 flex items-center gap-1 relative z-10">
                        <span className="font-bold">+8.1%</span> user growth
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Low Stock Items</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{metrics.lowStockItems}</h3>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-400 icon-glow" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-red-400 flex items-center gap-1 relative z-10">
                        Action Required
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart (CSS Only) */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-teal-400 icon-glow" />
                        Sales Trend (Last 7 Days)
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 border-b border-white/10 pb-2">
                        {trend.map((item: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-teal-500/20 hover:bg-teal-500 hover:shadow-[0_0_15px_rgba(20,184,166,0.5)] rounded-t-sm transition-all duration-300 relative border-t border-x border-teal-500/30"
                                    style={{ height: `${(item.value / 35000) * 100}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-panel border border-white/10 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        ₹{item.value}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-white mb-6">Sales by Category</h3>
                    {distribution.length > 0 ? (
                        <div className="space-y-6">
                            {distribution.map((item: any, i: number) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">{item.name}</span>
                                        <span className="font-bold text-white">{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full rounded-full shadow-lg ${i === 0 ? 'bg-teal-500 shadow-teal-500/50' :
                                                i === 1 ? 'bg-blue-500 shadow-blue-500/50' :
                                                    i === 2 ? 'bg-purple-500 shadow-purple-500/50' : 'bg-orange-500 shadow-orange-500/50'
                                                }`}
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No sales data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

