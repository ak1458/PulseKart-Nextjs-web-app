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
} from '@/lib/icons';
import SignOutModal from '@/components/ui/SignOutModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-transparent">
            {/* Sign Out Modal */}
            <SignOutModal 
                isOpen={isSignOutModalOpen} 
                onClose={() => setIsSignOutModalOpen(false)} 
            />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 lg:top-24 h-[calc(100vh-6rem)] z-50 w-64 glass-dock border-r border-white/10 
                    transform transition-transform duration-300 ease-out lg:translate-x-0 lg:ml-6 lg:rounded-2xl lg:mb-6
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">My Account</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
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
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                                            ${isActive
                                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400 icon-glow' : 'text-gray-500 group-hover:text-white'}`} />
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && <div className="absolute inset-0 bg-teal-400/5 blur-xl"></div>}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="my-4 border-t border-white/5"></div>

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
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                                            ${isActive
                                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400 icon-glow' : 'text-gray-500 group-hover:text-white'}`} />
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && <div className="absolute inset-0 bg-teal-400/5 blur-xl"></div>}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="my-4 border-t border-white/5"></div>

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
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                                            ${isActive
                                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400 icon-glow' : 'text-gray-500 group-hover:text-white'}`} />
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && <div className="absolute inset-0 bg-teal-400/5 blur-xl"></div>}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <button 
                            onClick={() => setIsSignOutModalOpen(true)}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pt-20 md:pt-24 px-4 pb-12">
                {/* Mobile Header */}
                <div className="lg:hidden glass-dock border-b border-white/10 p-4 flex items-center gap-3 sticky top-20 z-30 mb-6 rounded-xl">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-300 hover:bg-white/10 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-white">Dashboard</span>
                </div>

                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
