'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Package,
    Truck,
    CreditCard,
    Tag,
    Activity,
    Zap,
    Bot,
    MessageSquare,
    Layers,
    BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/admin/GlobalSearch';

const MENU_ITEMS = [
    { name: 'AI Worker', icon: Bot, path: '/admin/ai' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Prescriptions', icon: FileText, path: '/admin/prescriptions' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Inventory', icon: Activity, path: '/admin/inventory' },
    { name: 'Warehouse AI', icon: Layers, path: '/admin/warehouse' },
    { name: 'Rules Engine', icon: Zap, path: '/admin/rules' },
    { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { name: 'Delivery', icon: Truck, path: '/admin/delivery' },
    { name: 'Finance', icon: CreditCard, path: '/admin/finance' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Support', icon: MessageSquare, path: '/admin/support' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-[#1e293b] text-white flex-shrink-0 sticky top-0 h-screen z-40 hidden md:flex flex-col transition-all duration-300"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <img src="/logo.png" alt="PulseKart" className="h-8 w-auto object-contain" />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <img src="/logo.png" alt="PulseKart" className="h-8 w-auto object-contain" />
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <div className="px-4 mb-2">
                    <GlobalSearch />
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                {isSidebarOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                                )}
                                {!isSidebarOpen && isActive && (
                                    <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1e293b] text-white p-4 z-50 flex items-center justify-between">
                <div className="font-bold text-lg">PulseKart Admin</div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#1e293b] text-white z-50 flex flex-col shadow-2xl"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-white/10">
                            <span className="font-bold text-xl">Menu</span>
                            <button onClick={() => setIsSidebarOpen(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            {MENU_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === item.path
                                        ? 'bg-teal-600 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
