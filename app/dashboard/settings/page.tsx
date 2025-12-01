'use client';

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Smartphone, Moon, Globe, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        orders: true,
        prescriptions: true,
        tips: true,
        offers: false
    });

    const [appSettings, setAppSettings] = useState({
        darkMode: false,
        language: 'English'
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="animate-fade-in max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Profile Details</h2>
                            <p className="text-sm text-gray-500">Manage your personal information</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input type="text" defaultValue="Prophet" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                <input type="email" defaultValue="prophet@example.com" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                <input type="tel" defaultValue="+91 9876543210" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 active:scale-95">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Security</h2>
                            <p className="text-sm text-gray-500">Password & Authentication</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                            <span className="font-medium text-gray-900">Change Password</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-xs text-gray-500">Secure your account with 2FA</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 p-4 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold">
                            <LogOut className="w-4 h-4" /> Log Out All Devices
                        </button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                            <p className="text-sm text-gray-500">Manage your alerts</p>
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
                                    <p className="font-medium text-gray-900">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.key as keyof typeof notifications]}
                                        onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* App Settings */}
                <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">App Settings</h2>
                            <p className="text-sm text-gray-500">Customize your experience</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">Dark Mode</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">Language</span>
                            </div>
                            <select className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 font-bold">
                                <option>English</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                            <p className="text-sm text-red-600">Irreversible actions</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <button className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold shadow-sm hover:shadow-red-200 group">
                            <Trash2 className="w-4 h-4 group-hover:animate-bounce" /> Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
