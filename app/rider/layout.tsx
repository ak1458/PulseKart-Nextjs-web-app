'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Package, User, Bell, Menu, X, LogOut } from 'lucide-react';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const MENU_ITEMS = [
        { name: 'Tasks', icon: Package, path: '/rider' },
        { name: 'Map', icon: MapPin, path: '/rider/map' },
        { name: 'Profile', icon: User, path: '/rider/profile' },
        { name: 'Notifications', icon: Bell, path: '/rider/notifications' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-teal-600 text-white p-4 sticky top-0 z-50 shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Package className="w-5 h-5" />
                        </div>
                        <h1 className="font-bold text-lg">PulseRider</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-xs font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-teal-700 shadow-xl p-4 animate-fade-in">
                        <nav className="space-y-2">
                            {MENU_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === item.path ? 'bg-white text-teal-700' : 'text-teal-100 hover:bg-white/10'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                            <button className="w-full flex items-center gap-3 p-3 text-red-200 hover:bg-red-500/20 rounded-lg mt-4 border-t border-white/10">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Go Offline</span>
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 p-4 max-w-md mx-auto w-full">
                {children}
            </main>

            {/* Bottom Nav (Mobile Only) */}
            <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 flex justify-around p-2 pb-safe md:hidden">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
