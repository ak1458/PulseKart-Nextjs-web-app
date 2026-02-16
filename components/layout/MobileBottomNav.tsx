'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconShop, IconHealth, IconCart, IconAccount } from '@/lib/icons';

const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: IconHome },
    { href: '/shop', label: 'Shop', icon: IconShop },
    { href: '/health/chat', label: 'AI Health', icon: IconHealth, primary: true },
    { href: '/cart', label: 'Cart', icon: IconCart },
    { href: '/dashboard', label: 'Account', icon: IconAccount },
];

const HIDE_PREFIXES = ['/admin', '/rider', '/checkout', '/login', '/signup', '/forgot-password', '/reset-password'];

export default function MobileBottomNav() {
    const pathname = usePathname();

    if (!pathname) return null;
    if (HIDE_PREFIXES.some(prefix => pathname.startsWith(prefix))) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none">
            <div className="px-4 pointer-events-auto">
                <div className="glass-dock rounded-3xl px-5 py-3 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between">
                        {NAV_ITEMS.map((item) => {
                            const isActive = item.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(item.href);
                            const Icon = item.icon;

                            if (item.primary) {
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex flex-col items-center gap-1 -mt-6"
                                    >
                                        <span className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-[0_12px_30px_rgba(20,184,166,0.45)] border border-white/20">
                                            <Icon className="w-5 h-5 text-white" />
                                        </span>
                                        <span className="text-[10px] font-semibold text-teal-200">{item.label}</span>
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 px-2 ${isActive ? 'text-teal-300' : 'text-gray-400'} transition-colors`}
                                >
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-white/5'} border border-white/10`}>
                                        <Icon className="w-4 h-4" />
                                    </span>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}

