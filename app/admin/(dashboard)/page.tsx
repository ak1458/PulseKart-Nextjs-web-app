'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingBag,
    AlertCircle,
    Clock,
    CheckCircle,
    DollarSign,
    Package,
    Truck,
    Activity,
    FileText,
    Database,
    RefreshCw
} from '@/lib/icons';
import { motion } from 'framer-motion';

const STAT_TONES = {
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
} as const;

type StatTone = keyof typeof STAT_TONES;

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        revenue: 0,
        activeOrders: 0,
        pendingRx: 0,
        deliveryIssues: 0
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Simulate Real-time Redis Updates
    // Initialize with zero/static data
    useEffect(() => {
        // Future: Fetch real real-time metrics here
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulate fetch
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Ops Cockpit</h1>
                    <p className="text-gray-400 text-sm">Live operational metrics for today</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span> Live
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link href="/admin/exports" className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                        Export Report
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: `₹${metrics.revenue.toLocaleString()}`, change: '—', trend: 'neutral', icon: DollarSign, color: 'teal' },
                    { title: 'Active Orders', value: metrics.activeOrders, change: '—', trend: 'neutral', icon: ShoppingBag, color: 'blue' },
                    { title: 'Pending Rx', value: metrics.pendingRx, change: '—', trend: 'neutral', icon: FileText, color: 'orange' },
                    { title: 'Delivery Issues', value: metrics.deliveryIssues, change: '—', trend: 'neutral', icon: AlertCircle, color: 'red' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-24 h-24" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-xl border ${STAT_TONES[stat.color as StatTone]} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6 icon-glow" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stat.value}</h3>
                        <p className="text-sm text-gray-400 font-medium relative z-10">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Urgent Tasks & Live Feed */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Urgent Tasks */}
                <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-400 icon-glow" /> Urgent Attention
                        </h3>
                        <span className="text-xs font-bold bg-gray-500/10 text-gray-400 px-2 py-1 rounded-full border border-gray-500/20">0 Pending</span>
                    </div>
                    <div className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400">All caught up! No urgent tasks.</p>
                    </div>
                    <div className="p-4 bg-white/5 text-center border-t border-white/5">
                        <button className="text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors">View All Tasks</button>
                    </div>
                </div>

                {/* System Health */}
                <div className="glass-panel rounded-2xl border border-white/10 p-6">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-400 icon-glow" /> System Health
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'API Latency', value: '124ms', status: 'good' },
                            { label: 'Payment Gateway', value: 'Operational', status: 'good' },
                            { label: 'OCR Worker', value: 'Idle', status: 'neutral' },
                            { label: 'Redis Cache', value: 'Connected', status: 'good', icon: Database },
                            { label: 'Courier API', value: '98% Success', status: 'warning' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    {item.icon && <item.icon className="w-3 h-3 text-gray-500" />}
                                    {item.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                                        item.status === 'warning' ? 'bg-orange-500 shadow-[0_0_8px_#fb923c]' : 'bg-gray-500'
                                        }`}></span>
                                    <span className="text-sm font-bold text-white">{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Inventory Alerts</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Low Stock SKUs</span>
                                <span className="font-bold text-gray-500">0 Items</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Expiring Soon</span>
                                <span className="font-bold text-gray-500">0 Batches</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

