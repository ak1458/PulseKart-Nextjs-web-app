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
} from 'lucide-react';
import { motion } from 'framer-motion';

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
                    <h1 className="text-2xl font-bold text-gray-900">Ops Cockpit</h1>
                    <p className="text-gray-500 text-sm">Live operational metrics for today</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link href="/admin/exports" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        Export Report
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: `₹${metrics.revenue.toLocaleString()}`, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'teal' },
                    { title: 'Active Orders', value: metrics.activeOrders, change: '+5', trend: 'up', icon: ShoppingBag, color: 'blue' },
                    { title: 'Pending Rx', value: metrics.pendingRx, change: '-2', trend: 'down', icon: FileText, color: 'orange' },
                    { title: 'Delivery Issues', value: metrics.deliveryIssues, change: '+1', trend: 'up', icon: AlertCircle, color: 'red' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Urgent Tasks & Live Feed */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Urgent Tasks */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" /> Urgent Attention
                        </h3>
                        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">5 Pending</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[
                            { id: 'ORD-9921', msg: 'Prescription rejected by user', time: '5m ago', type: 'Rx' },
                            { id: 'ORD-9918', msg: 'Payment failed (Razorpay webhook)', time: '12m ago', type: 'Payment' },
                            { id: 'ORD-9845', msg: 'Courier pickup delayed > 2 hrs', time: '45m ago', type: 'Logistics' },
                        ].map((task, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${task.type === 'Rx' ? 'bg-blue-500' : task.type === 'Payment' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm group-hover:text-teal-600 transition-colors">{task.msg}</p>
                                        <p className="text-xs text-gray-500">{task.id} • {task.type}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-400">{task.time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 text-center">
                        <button className="text-sm font-bold text-teal-600 hover:text-teal-700">View All Tasks</button>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600" /> System Health
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
                                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    {item.icon && <item.icon className="w-3 h-3 text-gray-400" />}
                                    {item.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-green-500' :
                                        item.status === 'warning' ? 'bg-orange-500' : 'bg-gray-400'
                                        }`}></span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Inventory Alerts</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Low Stock SKUs</span>
                                <span className="font-bold text-red-600">12 Items</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Expiring Soon</span>
                                <span className="font-bold text-orange-600">45 Batches</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
