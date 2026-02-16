'use client';

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Smartphone, Moon, Globe, ChevronRight, LogOut, Trash2 } from '@/lib/icons';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        orders: true,
        prescriptions: true,
        tips: true,
        offers: false
    });

    const [appSettings, setAppSettings] = useState({
        darkMode: true,
        language: 'English'
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAppSetting = (key: keyof typeof appSettings) => {
        setAppSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="animate-fade-in max-w-3xl">
            <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 border border-teal-500/30">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Profile Details</h2>
                            <p className="text-sm text-gray-400">Manage your personal information</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Full name" 
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all font-medium text-white placeholder-gray-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all font-medium text-white placeholder-gray-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="+91 98765 43210" 
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all font-medium text-white placeholder-gray-500" 
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 active:scale-95">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/30">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Security</h2>
                            <p className="text-sm text-gray-400">Password & Authentication</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <button className="w-full flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/5 transition-colors group border border-white/10">
                            <span className="font-medium text-white">Change Password</span>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/10">
                            <div>
                                <p className="font-medium text-white">Two-Factor Authentication</p>
                                <p className="text-xs text-gray-400">Secure your account with 2FA</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 p-4 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors font-bold">
                            <LogOut className="w-4 h-4" /> Log Out All Devices
                        </button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 border border-orange-500/30">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Notifications</h2>
                            <p className="text-sm text-gray-400">Manage your alerts</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { key: 'orders', label: 'Order Updates', desc: 'Get notified about delivery status' },
                            { key: 'prescriptions', label: 'Prescription Updates', desc: 'Pharmacist review status' },
                            { key: 'tips', label: 'Health Tips', desc: 'Daily wellness suggestions' },
                            { key: 'offers', label: 'Offer Alerts', desc: 'Discounts and promotions' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.key as keyof typeof notifications]}
                                        onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* App Settings */}
                <section className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 border border-purple-500/30">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">App Settings</h2>
                            <p className="text-sm text-gray-400">Customize your experience</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-white">Dark Mode</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={appSettings.darkMode} 
                                    onChange={() => toggleAppSetting('darkMode')}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-white/10 peer-checked:bg-teal-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-white">Language</span>
                            </div>
                            <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-teal-500/50 focus:border-teal-500/50 block p-2.5 font-bold">
                                <option className="bg-[#0b1324]">English</option>
                                <option className="bg-[#0b1324]">Hindi</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="glass-panel rounded-2xl border border-red-500/30 overflow-hidden bg-red-500/5">
                    <div className="p-6 border-b border-red-500/20 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border border-red-500/30">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-300">Danger Zone</h2>
                            <p className="text-sm text-red-400/70">Irreversible actions</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <button className="w-full flex items-center justify-center gap-2 p-4 glass-panel border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold hover:shadow-lg hover:shadow-red-500/20 group">
                            <Trash2 className="w-4 h-4 group-hover:animate-bounce" /> Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
