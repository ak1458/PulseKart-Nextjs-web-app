'use client';

import React, { useState } from 'react';
import {
    MapPin,
    Truck,
    Thermometer,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Building,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function WarehouseInitPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        type: 'fulfillment_center',
        address: '',
        city: '',
        pincode: '',
        capacity: '',
        isColdChain: false,
        zones: ['Zone A', 'Zone B'],
        courierPartner: 'dunzo'
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinish = () => {
        alert('Warehouse initialized successfully! (Mock)');
        // Redirect to inventory
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl">
                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8 px-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                            </div>
                            <span className={`text-xs font-medium ${step >= s ? 'text-teal-700' : 'text-gray-400'}`}>
                                {s === 1 ? 'Basics' : s === 2 ? 'Location' : s === 3 ? 'Ops' : 'Review'}
                            </span>
                        </div>
                    ))}
                    {/* Progress Bar Background */}
                    <div className="absolute top-[4.5rem] left-0 w-full h-1 bg-gray-200 -z-0 hidden md:block max-w-2xl mx-auto right-0" />
                    {/* Active Progress Bar - simplified for this view */}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Building className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Warehouse Details</h2>
                                        <p className="text-gray-500">Let's start with the basics of your new facility.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Warehouse Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="e.g. Mumbai Central Hub"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Facility Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            >
                                                <option value="fulfillment_center">Fulfillment Center (FC)</option>
                                                <option value="dark_store">Dark Store</option>
                                                <option value="retail_store">Retail Store (POS)</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Location & Coverage</h2>
                                        <p className="text-gray-500">Where is this warehouse located?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Address Line 1</label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="Street address..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                                                <input
                                                    type="text"
                                                    value={formData.pincode}
                                                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                    placeholder="000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Layers className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Operations Config</h2>
                                        <p className="text-gray-500">Set up capacity and special handling.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Storage Capacity (Sq. Ft)</label>
                                            <input
                                                type="number"
                                                value={formData.capacity}
                                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>

                                        <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <Thermometer className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-bold text-gray-900 block">Cold Chain Enabled</span>
                                                <span className="text-sm text-gray-500">Facility has temperature controlled zones for vaccines/insulin.</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={formData.isColdChain}
                                                onChange={e => setFormData({ ...formData, isColdChain: e.target.checked })}
                                                className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                        </label>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Default Courier Partner</label>
                                            <select
                                                value={formData.courierPartner}
                                                onChange={e => setFormData({ ...formData, courierPartner: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            >
                                                <option value="dunzo">Dunzo (Hyperlocal)</option>
                                                <option value="delhivery">Delhivery (National)</option>
                                                <option value="shadowfax">Shadowfax</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Ready to Launch?</h2>
                                        <p className="text-gray-500">Review your warehouse details before creating.</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-bold text-gray-900">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type</span>
                                            <span className="font-bold text-gray-900 capitalize">{formData.type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Location</span>
                                            <span className="font-bold text-gray-900 text-right">{formData.city} ({formData.pincode})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Cold Chain</span>
                                            <span className={`font-bold ${formData.isColdChain ? 'text-blue-600' : 'text-gray-900'}`}>
                                                {formData.isColdChain ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        ) : (
                            <Link href="/admin/inventory" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                Cancel
                            </Link>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                            >
                                Initialize Warehouse <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
