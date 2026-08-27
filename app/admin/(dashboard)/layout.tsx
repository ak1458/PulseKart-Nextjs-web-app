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
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin navigation.
 *
 * Every entry here resolves to a page backed by a real API module. Warehouse AI,
 * Rules Engine, Delivery, Finance, Payroll, CMS, Exports, Returns, Attendance,
 * Pharmacist and Support were removed along with their pages: they rendered
 * finished-looking UI over endpoints that do not exist (/api/v1/cms/pages,
 * /api/v1/delivery/zones, /api/v1/finance/dashboard and friends all 404), or
 * over arrays hardcoded to empty. Back-office concerns belong to the POS
 * product; rebuild them there against real endpoints.
 */
const MENU_ITEMS = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Prescriptions', icon: FileText, path: '/admin/prescriptions' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Inventory', icon: Activity, path: '/admin/inventory' },
    { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'AI Worker', icon: Bot, path: '/admin/ai' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-transparent flex -mt-[var(--site-top-offset)]">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="glass-dock w-72 text-white flex-shrink-0 sticky top-0 h-screen z-40 hidden md:flex flex-col border-r border-white/10"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">PulseKart</span>
                        </div>
                    ) : (
                        <div className="flex justify-center w-full">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <div className="px-4">
                    <GlobalSearch />
                </div>

                <nav className="flex-1 overflow-y-auto pt-2 pb-4 px-3 space-y-1 custom-scrollbar">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400 icon-glow' : 'text-gray-500 group-hover:text-white'}`} />
                                {isSidebarOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap relative z-10">{item.name}</span>
                                )}
                                {!isSidebarOpen && isActive && (
                                    <div className="absolute left-16 glass-panel border border-white/10 text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
                                        {item.name}
                                    </div>
                                )}
                                {isActive && <div className="absolute inset-0 bg-teal-400/5 blur-xl"></div>}
                            </Link>
                        );

                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={logout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 glass-dock border-b border-white/10 text-white p-4 z-50 flex items-center justify-between">
                <div className="font-bold text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" /> Ops Cockpit
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 w-full max-w-[1400px] mr-auto">
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
                        className="fixed inset-y-0 left-0 z-50 w-72 glass-dock border-r border-white/10 md:hidden"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-white/10">
                            <span className="font-bold text-xl text-white">Menu</span>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
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
                                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
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

