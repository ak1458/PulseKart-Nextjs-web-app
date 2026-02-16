'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    User, 
    Package, 
    Heart, 
    MapPin, 
    Settings, 
    ChevronRight,
    FileText,
    Shield,
    Clock,
    ArrowRight,
    Sparkles,
    CreditCard,
    Phone,
    Mail,
    Edit2,
    Plus,
    Trash2,
    LogOut
} from '@/lib/icons';
import SignOutModal from '@/components/ui/SignOutModal';
import HealthCheckModal from '@/components/ui/HealthCheckModal';
import { useHealthCheck } from '@/lib/health-check';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
}

interface Address {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi';
    name: string;
    last4: string;
    isDefault: boolean;
}

const QUICK_LINKS = [
    { 
        name: 'My Orders', 
        href: '/dashboard/orders', 
        icon: Package, 
        desc: 'Track & manage your purchases',
        color: 'from-blue-500/20 to-blue-600/10',
        iconColor: 'text-blue-400'
    },
    { 
        name: 'Prescriptions', 
        href: '/dashboard/prescriptions', 
        icon: FileText, 
        desc: 'Upload and manage prescriptions',
        color: 'from-emerald-500/20 to-emerald-600/10',
        iconColor: 'text-emerald-400'
    },
    { 
        name: 'Saved Items', 
        href: '/dashboard/saved', 
        icon: Heart, 
        desc: 'Your wishlist and favorites',
        color: 'from-pink-500/20 to-pink-600/10',
        iconColor: 'text-pink-400'
    },
    { 
        name: 'Addresses', 
        href: '/dashboard/addresses', 
        icon: MapPin, 
        desc: 'Manage delivery locations',
        color: 'from-purple-500/20 to-purple-600/10',
        iconColor: 'text-purple-400'
    },
];

export default function AccountPage() {
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'payments'>('overview');
    
    // Health check hook
    const { showCheckIn, pendingCheckIn, completeCheckIn, dismissCheckIn } = useHealthCheck();
    
    // User profile state
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: ''
    });
    
    // Load profile from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pulsekart_profile');
        if (saved) {
            setProfile(JSON.parse(saved));
        }
    }, []);
    
    const saveProfile = () => {
        localStorage.setItem('pulsekart_profile', JSON.stringify(profile));
    };

    const [addresses, setAddresses] = useState<Address[]>([]);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const [orders, setOrders] = useState<any[]>([]);

    const handleHealthCheckComplete = () => {
        if (pendingCheckIn) {
            completeCheckIn(pendingCheckIn.id);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-16 px-4">
            {/* Sign Out Modal */}
            <SignOutModal 
                isOpen={isSignOutModalOpen} 
                onClose={() => setIsSignOutModalOpen(false)} 
            />

            {/* Health Check Modal */}
            <HealthCheckModal
                isOpen={showCheckIn}
                onClose={dismissCheckIn}
                diseaseName={pendingCheckIn?.diseaseName || 'your condition'}
                medicineName={pendingCheckIn?.medicineName || 'prescribed medicine'}
                daysSincePurchase={pendingCheckIn ? Math.floor((Date.now() - new Date(pendingCheckIn.date).getTime()) / (1000 * 60 * 60 * 24)) : 7}
            />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
                    <p className="text-gray-400">Manage your profile, orders, and preferences</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview', icon: User },
                        { id: 'profile', label: 'Profile', icon: Edit2 },
                        { id: 'payments', label: 'Payments', icon: CreditCard },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                        : 'glass-panel text-gray-400 border border-white/10 hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Profile Summary Card */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-8">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/10 shadow-lg shadow-teal-500/20">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {profile.name || 'Welcome, Guest!'}
                                    </h2>
                                    <p className="text-gray-400 mb-4">
                                        {profile.email || 'Complete your profile for personalized experience'}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {profile.phone && (
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300">
                                                <Phone className="w-4 h-4" /> {profile.phone}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg text-sm text-emerald-300 border border-emerald-500/20">
                                            <Shield className="w-4 h-4" /> Verified Account
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className="px-6 py-2.5 btn-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {QUICK_LINKS.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${link.color} border border-white/10`}>
                                                <Icon className={`w-6 h-6 ${link.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors">
                                                    {link.name}
                                                </h3>
                                                <p className="text-sm text-gray-400">{link.desc}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Recent Orders Preview */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                                <Link href="/dashboard/orders" className="text-sm text-teal-400 hover:text-teal-300">
                                    View All →
                                </Link>
                            </div>
                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.slice(0, 2).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-white">#{order.id}</p>
                                                <p className="text-xs text-gray-400">{order.items} items • {order.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white">₹{order.total}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    order.status === 'delivered' 
                                                        ? 'bg-emerald-500/20 text-emerald-300' 
                                                        : 'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">No orders yet</p>
                            )}
                        </div>

                        {/* Settings & Sign Out */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link href="/dashboard/settings">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-white/10">
                                            <Settings className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors">
                                                Settings
                                            </h3>
                                            <p className="text-sm text-gray-400">Notifications, security, preferences</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>

                            <button onClick={() => setIsSignOutModalOpen(true)}>
                                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all group text-left w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
                                            <LogOut className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg group-hover:text-red-300 transition-colors">
                                                Sign Out
                                            </h3>
                                            <p className="text-sm text-gray-400">Securely log out of your account</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="glass-panel rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                        <div className="space-y-6 max-w-2xl">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={profile.dateOfBirth}
                                        onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                                <div className="flex gap-3">
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setProfile({...profile, gender: g})}
                                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                                                profile.gender === g
                                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                                    : 'glass-panel text-gray-400 border border-white/10 hover:bg-white/5'
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={saveProfile}
                                className="px-8 py-3 btn-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>

                        {/* Saved Addresses */}
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">Saved Addresses</h3>
                                <Link 
                                    href="/dashboard/addresses"
                                    className="px-4 py-2 glass-panel rounded-xl text-sm font-medium text-white border border-white/10 hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add New
                                </Link>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="p-4 glass-panel rounded-xl border border-white/10">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-xs rounded border border-teal-500/30">
                                                    {addr.type}
                                                </span>
                                                {addr.isDefault && (
                                                    <span className="text-xs text-emerald-400">Default</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="font-medium text-white">{addr.name}</p>
                                        <p className="text-sm text-gray-400 mt-1">{addr.address}</p>
                                        <p className="text-sm text-gray-400">{addr.city} - {addr.pincode}</p>
                                        <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="glass-panel rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Payment Methods</h2>
                            <button className="px-4 py-2 glass-panel rounded-xl text-sm font-medium text-white border border-white/10 hover:bg-white/5 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Payment Method
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {paymentMethods.map((method) => (
                                <div 
                                    key={method.id} 
                                    className={`p-5 rounded-xl border transition-all ${
                                        method.isDefault 
                                            ? 'bg-teal-500/5 border-teal-500/30' 
                                            : 'glass-panel border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                method.type === 'card' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                                            }`}>
                                                <CreditCard className={`w-6 h-6 ${
                                                    method.type === 'card' ? 'text-blue-400' : 'text-purple-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{method.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    {method.type === 'card' ? '•••• ' : 'UPI '}
                                                    {method.last4}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {method.isDefault && (
                                                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                                                    Default
                                                </span>
                                            )}
                                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* UPI IDs Section */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Saved UPI IDs</h3>
                            <div className="p-4 glass-panel rounded-xl border border-white/10 border-dashed">
                                <p className="text-gray-400 text-sm text-center py-4">
                                    No UPI IDs saved yet. Add your UPI for faster checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 p-6 glass-panel rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">Need help with something?</h3>
                            <p className="text-sm text-gray-400 mb-3">
                                Visit our comprehensive help center for answers to frequently asked questions.
                            </p>
                            <Link 
                                href="/help" 
                                className="inline-flex items-center gap-2 text-sm text-teal-400 font-medium hover:text-teal-300"
                            >
                                Visit Help Center <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
