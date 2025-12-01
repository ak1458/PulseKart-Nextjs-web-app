'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Zone {
    id: number;
    name: string;
    pincodes: string[];
    standard_cost: number;
    express_cost: number;
    delivery_days_min: number;
    delivery_days_max: number;
    is_active: boolean;
}

export default function AdminDeliveryPage() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        pincodes: '',
        standard_cost: '',
        express_cost: '',
        delivery_days_min: '',
        delivery_days_max: ''
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await fetch('/api/v1/delivery/zones');
            const data = await res.json();
            setZones(data);
        } catch (error) {
            console.error('Failed to fetch zones', error);
        }
    };

    const handleEdit = (zone: Zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            pincodes: (zone.pincodes || []).join(', '),
            standard_cost: zone.standard_cost.toString(),
            express_cost: zone.express_cost.toString(),
            delivery_days_min: zone.delivery_days_min.toString(),
            delivery_days_max: zone.delivery_days_max.toString()
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this zone?')) return;
        try {
            await fetch(`/api/v1/delivery/zones/${id}`, { method: 'DELETE' });
            fetchZones();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingZone ? `/api/v1/delivery/zones/${editingZone.id}` : '/api/v1/delivery/zones';
            const method = editingZone ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                pincodes: formData.pincodes.split(',').map(p => p.trim()).filter(Boolean),
                standard_cost: parseFloat(formData.standard_cost),
                express_cost: parseFloat(formData.express_cost),
                delivery_days_min: parseInt(formData.delivery_days_min),
                delivery_days_max: parseInt(formData.delivery_days_max),
                is_active: true
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`Zone ${editingZone ? 'updated' : 'created'} successfully!`);
                setIsModalOpen(false);
                setEditingZone(null);
                setFormData({ name: '', pincodes: '', standard_cost: '', express_cost: '', delivery_days_min: '', delivery_days_max: '' });
                fetchZones();
            } else {
                alert('Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Delivery & Logistics</h1>
                    <p className="text-gray-500 text-sm">Manage delivery zones and shipping rates</p>
                </div>
                <button
                    onClick={() => {
                        setEditingZone(null);
                        setFormData({ name: '', pincodes: '', standard_cost: '', express_cost: '', delivery_days_min: '', delivery_days_max: '' });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-200"
                >
                    <Plus className="w-4 h-4" /> Add Zone
                </button>
            </div>

            {zones.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Delivery Zones</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Configure delivery zones, assign courier partners, and track fleet performance.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zones.map((zone) => (
                        <div key={zone.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(zone)} className="text-gray-400 hover:text-teal-600"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(zone.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{zone.name}</h3>
                                    <p className="text-xs text-gray-500">{zone.pincodes?.length || 0} Pincodes Covered</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Standard Shipping:</span>
                                    <span className="font-bold text-gray-900">₹{zone.standard_cost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Express Shipping:</span>
                                    <span className="font-bold text-gray-900">₹{zone.express_cost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Est. Delivery:</span>
                                    <span className="font-medium">{zone.delivery_days_min}-{zone.delivery_days_max} Days</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h3>
                                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Zone Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="Metro Cities"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Pincodes (Comma separated)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.pincodes}
                                        onChange={e => setFormData({ ...formData, pincodes: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="400001, 400002, 110001..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Standard Cost (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.standard_cost}
                                            onChange={e => setFormData({ ...formData, standard_cost: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Express Cost (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.express_cost}
                                            onChange={e => setFormData({ ...formData, express_cost: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Min Days</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.delivery_days_min}
                                            onChange={e => setFormData({ ...formData, delivery_days_min: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Max Days</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.delivery_days_max}
                                            onChange={e => setFormData({ ...formData, delivery_days_max: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200"
                                    >
                                        {editingZone ? 'Update Zone' : 'Create Zone'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
