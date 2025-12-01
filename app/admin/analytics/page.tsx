'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, AlertCircle, BarChart2 } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/v1/bi/dashboard');
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

            const text = await res.text();
            try {
                const json = JSON.parse(text);
                setData(json);
            } catch (e) {
                console.error('Invalid JSON:', text);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
            setData(null); // Ensure data is null on error
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

    const { metrics, trend, distribution } = data;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{metrics.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                        <span className="font-bold">+12.5%</span> from last month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-600 flex items-center gap-1">
                        <span className="font-bold">+5.2%</span> new orders
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers}</h3>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-purple-600 flex items-center gap-1">
                        <span className="font-bold">+8.1%</span> user growth
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.lowStockItems}</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-red-600 flex items-center gap-1">
                        Action Required
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart (CSS Only) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-teal-600" />
                        Sales Trend (Last 7 Days)
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {trend.map((item: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-teal-500 rounded-t-sm transition-all duration-500 group-hover:bg-teal-600 relative"
                                    style={{ height: `${(item.value / 10000) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        ₹{item.value}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Sales by Category</h3>
                    <div className="space-y-4">
                        {distribution.map((item: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="font-bold text-gray-900">{item.value}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${i === 0 ? 'bg-teal-500' :
                                            i === 1 ? 'bg-blue-500' :
                                                i === 2 ? 'bg-purple-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
