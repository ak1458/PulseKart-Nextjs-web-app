'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Navigation, Home, Briefcase } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Addresses are loaded from the backend. Keep empty for a clean client-ready view.
const ADDRESSES: any[] = [];

export default function AddressesPage() {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="animate-fade-in relative min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">My Addresses</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 btn-gradient text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {ADDRESSES.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <MapPin className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No addresses saved</h2>
                    <p className="text-sm text-gray-400">Add your first delivery address to speed up checkout.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ADDRESSES.map((addr) => (
                        <motion.div
                            key={addr.id}
                            layoutId={`addr-${addr.id}`}
                            className={`relative p-6 rounded-2xl border-2 transition-all group ${addr.isDefault ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10 glass-panel hover:border-white/20'
                                }`}
                        >
                            {addr.isDefault && (
                                <div className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <CheckCircle className="w-3 h-3" /> Default
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${addr.type === 'Home' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                        {addr.type === 'Home' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                    </div>
                                    <span className="font-bold text-white">{addr.type}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-teal-400 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <p className="font-bold text-white">{addr.name}</p>
                                <p className="text-sm text-gray-400">{addr.address}</p>
                                <p className="text-sm text-gray-400">{addr.city} - {addr.pincode}</p>
                                <p className="text-sm text-gray-500 mt-2">Phone: {addr.phone}</p>
                            </div>

                            {!addr.isDefault && (
                                <button className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline">
                                    Set as Default
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Address Slide-over */}
            <AnimatePresence>
                {isAdding && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[400px] glass-dock z-50 shadow-2xl p-6 overflow-y-auto border-l border-white/10"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Add New Address</h2>

                            <form className="space-y-4">
                                <button
                                    type="button"
                                    className="w-full py-3 border-2 border-dashed border-teal-500/30 rounded-xl text-teal-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-500/10 transition-colors mb-6"
                                >
                                    <Navigation className="w-4 h-4" /> Use My Current Location
                                </button>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder-gray-500" placeholder="John Doe" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                                    <input type="tel" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder-gray-500" placeholder="9876543210" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pincode</label>
                                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder-gray-500" placeholder="110001" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address (House No, Building, Street)</label>
                                    <textarea className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder-gray-500 h-24" placeholder="Flat 101, Galaxy Apts..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City / District</label>
                                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder-gray-500" placeholder="New Delhi" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address Type</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Work', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                className="flex-1 py-2 rounded-lg border border-white/10 text-sm font-medium text-gray-300 hover:border-teal-500/50 hover:text-teal-400 focus:bg-teal-500/10 focus:border-teal-500/50 focus:text-teal-300 transition-all"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl btn-gradient text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
