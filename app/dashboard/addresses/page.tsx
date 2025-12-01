'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Navigation, Home, Briefcase, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADDRESSES = [
    {
        id: 1,
        type: 'Home',
        name: 'Prophet',
        phone: '9876543210',
        address: '123, Green Valley Apts, Vasant Vihar',
        city: 'New Delhi',
        pincode: '110057',
        isDefault: true
    },
    {
        id: 2,
        type: 'Work',
        name: 'Prophet',
        phone: '9876543210',
        address: 'Office No 4, Tech Park, Sector 62',
        city: 'Noida',
        pincode: '201301',
        isDefault: false
    }
];

export default function AddressesPage() {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="animate-fade-in relative min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ADDRESSES.map((addr) => (
                    <motion.div
                        key={addr.id}
                        layoutId={`addr-${addr.id}`}
                        className={`relative p-6 rounded-2xl border-2 transition-all group ${addr.isDefault ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                    >
                        {addr.isDefault && (
                            <div className="absolute -top-3 left-6 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <CheckCircle className="w-3 h-3" /> Default
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${addr.type === 'Home' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {addr.type === 'Home' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                </div>
                                <span className="font-bold text-gray-900">{addr.type}</span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-teal-600 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 mb-4">
                            <p className="font-bold text-gray-900">{addr.name}</p>
                            <p className="text-sm text-gray-600">{addr.address}</p>
                            <p className="text-sm text-gray-600">{addr.city} - {addr.pincode}</p>
                            <p className="text-sm text-gray-500 mt-2">Phone: {addr.phone}</p>
                        </div>

                        {!addr.isDefault && (
                            <button className="text-xs font-bold text-teal-600 hover:underline">
                                Set as Default
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add Address Slide-over */}
            <AnimatePresence>
                {isAdding && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white z-50 shadow-2xl p-6 overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Address</h2>

                            <form className="space-y-4">
                                <button
                                    type="button"
                                    className="w-full py-3 border-2 border-dashed border-teal-200 rounded-xl text-teal-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors mb-6"
                                >
                                    <Navigation className="w-4 h-4" /> Use My Current Location
                                </button>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all" placeholder="John Doe" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input type="tel" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all" placeholder="9876543210" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all" placeholder="110001" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address (House No, Building, Street)</label>
                                    <textarea className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all h-24" placeholder="Flat 101, Galaxy Apts..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / District</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all" placeholder="New Delhi" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address Type</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Work', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-teal-500 hover:text-teal-600 focus:bg-teal-50 focus:border-teal-500 focus:text-teal-700 transition-all"
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
                                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
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
