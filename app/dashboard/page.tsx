'use client';

import Link from 'next/link';
import { 
    Package, 
    FileText, 
    Heart, 
    MapPin, 
    ChevronRight,
    User,
    Sparkles,
    Plus,
    ShoppingBag
} from '@/lib/icons';

const QUICK_LINKS = [
    { 
        name: 'Orders', 
        href: '/dashboard/orders', 
        icon: Package, 
        desc: 'View and track your orders',
        color: 'from-blue-500/20 to-blue-600/10',
        iconColor: 'text-blue-400'
    },
    { 
        name: 'Prescriptions', 
        href: '/dashboard/prescriptions', 
        icon: FileText, 
        desc: 'Manage your prescriptions',
        color: 'from-emerald-500/20 to-emerald-600/10',
        iconColor: 'text-emerald-400'
    },
    { 
        name: 'Saved Items', 
        href: '/dashboard/saved', 
        icon: Heart, 
        desc: 'Your wishlist',
        color: 'from-pink-500/20 to-pink-600/10',
        iconColor: 'text-pink-400'
    },
    { 
        name: 'Addresses', 
        href: '/dashboard/addresses', 
        icon: MapPin, 
        desc: 'Delivery locations',
        color: 'from-purple-500/20 to-purple-600/10',
        iconColor: 'text-purple-400'
    },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
                <p className="text-gray-400">Quick access to your account</p>
            </div>

            {/* Profile Summary */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white border-2 border-white/10">
                        <User className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">Guest User</h2>
                        <p className="text-sm text-gray-400">Sign in to view your orders and prescriptions</p>
                    </div>
                    <Link 
                        href="/login" 
                        className="px-5 py-2.5 btn-gradient text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${link.color} border border-white/10`}>
                                    <Icon className={`w-5 h-5 ${link.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">
                                        {link.name}
                                    </h3>
                                    <p className="text-xs text-gray-400">{link.desc}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Empty State - Recent Activity */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No recent activity</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                    Your recent orders and prescriptions will appear here once you sign in and start using your account.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link 
                        href="/shop" 
                        className="px-5 py-2.5 btn-gradient text-white font-bold rounded-xl text-sm"
                    >
                        Start Shopping
                    </Link>
                    <Link 
                        href="/upload-rx" 
                        className="px-5 py-2.5 glass-panel text-white font-bold rounded-xl text-sm border border-white/10 hover:bg-white/5 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Upload Prescription
                    </Link>
                </div>
            </div>

            {/* Help Section */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-teal-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">Need help getting started?</h3>
                        <p className="text-sm text-gray-400">Learn how to use PulseKart features</p>
                    </div>
                    <Link 
                        href="/help" 
                        className="px-4 py-2 text-teal-400 font-bold text-sm hover:text-teal-300"
                    >
                        Help Center →
                    </Link>
                </div>
            </div>
        </div>
    );
}
