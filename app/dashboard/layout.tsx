'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    FileText,
    Heart,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
    { name: 'Saved Items', href: '/dashboard/saved', icon: Heart },
    { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">My Account</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-1">
                            {[
                                { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
                                { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
                                { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-teal-50 text-teal-600 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="my-4 border-t border-gray-100"></div>

                        <div className="space-y-1">
                            {[
                                { name: 'Saved Items', href: '/dashboard/saved', icon: Heart },
                                { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-teal-50 text-teal-600 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="my-4 border-t border-gray-100"></div>

                        <div className="space-y-1">
                            {[
                                { name: 'Settings', href: '/dashboard/settings', icon: Settings },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-teal-50 text-teal-600 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-gray-800">Dashboard</span>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
