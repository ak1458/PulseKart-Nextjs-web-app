import React from 'react';
import Link from 'next/link';
import { Package, FileText, CreditCard, ChevronRight, RefreshCw, Activity, Sun, Wallet, Pill, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome & Health Tip */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                👋
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome back, Prophet</h1>
                                <p className="text-teal-100 text-sm">Last login: Today, 9:41 AM</p>
                            </div>
                        </div>
                        <p className="text-lg font-medium text-white/90 mb-6 max-w-md">
                            Your last order was delivered yesterday. <br />
                            Need a refill on your vitamins?
                        </p>
                        <Link href="/shop" className="inline-flex items-center gap-2 bg-white text-teal-800 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-teal-50 transition-colors shadow-sm active:scale-95">
                            Order Now <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                </div>

                {/* Daily Health Tip */}
                <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                            <Sun className="w-5 h-5 animate-spin-slow" /> Daily Health Tip
                        </div>
                        <p className="text-gray-800 font-medium leading-relaxed">
                            "Drinking enough water helps maintain immunity. Aim for 8 glasses today!"
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                        <Activity className="w-4 h-4 animate-pulse" /> AI-Generated for you
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-200/50 rounded-full blur-xl"></div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Active Orders', value: '2', sub: 'In Transit', icon: ShoppingBag, color: 'blue', link: '/dashboard/orders', progress: 66 },
                    { title: 'Prescriptions', value: '5', sub: '1 Expiring Soon', icon: Pill, color: 'teal', link: '/dashboard/prescriptions', progress: 80 },
                    { title: 'Wallet Balance', value: '₹450', sub: '+₹50 Cashback', icon: Wallet, color: 'purple', link: '/dashboard/wallet', progress: 33 },
                ].map((stat, i) => (
                    <Link
                        href={stat.link}
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl transition-colors bg-${stat.color}-50 group-hover:bg-${stat.color}-100`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
                            </div>
                            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <span className={`text-xs font-bold text-${stat.color}-600`}>{stat.sub}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                            <div
                                className={`h-1.5 rounded-full bg-${stat.color}-500 transition-all duration-1000 ease-out`}
                                style={{ width: `${stat.progress}%` }}
                            ></div>
                        </div>
                        <div className={`text-xs text-gray-400 group-hover:text-${stat.color}-600 transition-colors flex items-center gap-1`}>
                            View Details <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-lg">Recent Orders</h3>
                    <Link href="/dashboard/orders" className="text-sm text-teal-600 font-bold hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {[
                        { id: 'ORD-2024-156', date: 'Nov 29, 2024', amount: '1,210', status: 'Delivered', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80' },
                        { id: 'ORD-2024-256', date: 'Nov 30, 2024', amount: '1,220', status: 'Delivered', img: 'https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=100&q=80' }
                    ].map((order, i) => (
                        <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4 group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group-hover:scale-105 transition-transform">
                                    <img src={order.img} alt="Product" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors">{order.id}</p>
                                    <p className="text-sm text-gray-500 mb-1">Delivered on {order.date}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <p className="font-bold text-gray-900 text-lg">₹{order.amount}</p>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors active:scale-95 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-200">
                                    <RefreshCw className="w-3.5 h-3.5" /> Reorder
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
