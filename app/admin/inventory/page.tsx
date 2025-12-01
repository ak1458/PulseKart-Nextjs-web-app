'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Search,
    Filter,
    AlertTriangle,
    History,
    Plus,
    Minus,
    MapPin,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface InventoryItem {
    id: number;
    sku: string;
    product_name: string;
    warehouse_name: string;
    warehouse_code: string;
    qty_available: number;
    qty_reserved: number;
    batch_no: string;
    expiry_date: string;
}

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [adjustForm, setAdjustForm] = useState({ type: 'add', quantity: 0, reason: '' });
    const [filters, setFilters] = useState({ search: '', warehouse: '' });

    useEffect(() => {
        fetchInventory();
    }, [filters]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.warehouse && filters.warehouse !== 'All Warehouses') params.append('warehouse', filters.warehouse);

            const res = await fetch(`http://localhost:4000/api/v1/inventory?${params.toString()}`);
            const data = await res.json();
            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setAdjustForm({ type: 'add', quantity: 0, reason: '' });
        setShowAdjustModal(true);
    };

    const handleSaveAdjustment = async () => {
        if (!selectedItem) return;

        try {
            const res = await fetch('http://localhost:4000/api/v1/inventory/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sku: selectedItem.sku,
                    warehouse_code: selectedItem.warehouse_code,
                    batch_no: selectedItem.batch_no,
                    quantity: adjustForm.quantity,
                    reason: adjustForm.reason,
                    type: adjustForm.type
                })
            });

            if (res.ok) {
                alert('Stock adjusted successfully');
                setShowAdjustModal(false);
                fetchInventory();
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Adjustment failed:', error);
            alert('Failed to adjust stock');
        }
    };

    const getStatus = (qty: number) => {
        if (qty === 0) return 'Out of Stock';
        if (qty < 10) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-green-100 text-green-700';
            case 'Low Stock': return 'bg-orange-100 text-orange-700';
            case 'Out of Stock': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Box className="w-6 h-6 text-teal-600" />
                        Inventory Management
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time stock tracking across warehouses</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        <History className="w-4 h-4" />
                        Stock History
                    </button>
                    <Link href="/admin/warehouse/init" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        <MapPin className="w-4 h-4" />
                        Add Warehouse
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        <Plus className="w-4 h-4" />
                        Stock In (PO)
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Total Items</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{inventory.length}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50 text-green-600">
                        <Box className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Low Stock Items</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {inventory.filter(i => i.qty_available < 10 && i.qty_available > 0).length}
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Out of Stock</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {inventory.filter(i => i.qty_available === 0).length}
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by SKU, Name, or Batch..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={filters.warehouse}
                        onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                    >
                        <option>All Warehouses</option>
                        <option>Mumbai Central</option>
                        <option>Pune Hub</option>
                    </select>
                    <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Product / SKU</th>
                                <th className="px-6 py-4">Warehouse</th>
                                <th className="px-6 py-4">Batch Info</th>
                                <th className="px-6 py-4 text-center">Available</th>
                                <th className="px-6 py-4 text-center">Reserved</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8">Loading inventory...</td></tr>
                            ) : inventory.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8">No inventory found.</td></tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">{item.sku}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {item.warehouse_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <p className="font-medium text-gray-700">Batch: {item.batch_no}</p>
                                                <p className="text-gray-500">Exp: {new Date(item.expiry_date).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900 text-lg">
                                            {item.qty_available}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-500">
                                            {item.qty_reserved}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(getStatus(item.qty_available))}`}>
                                                {getStatus(item.qty_available)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleAdjustClick(item)}
                                                className="text-teal-600 hover:text-teal-700 font-bold text-xs hover:underline"
                                            >
                                                Adjust Stock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {showAdjustModal && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Adjust Stock</h3>
                                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <Minus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-sm font-bold text-gray-900">{selectedItem.product_name}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.sku} • {selectedItem.warehouse_name}</p>
                                    <p className="text-sm font-medium text-gray-700 mt-2">Current Available: <span className="font-bold">{selectedItem.qty_available}</span></p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${adjustForm.type === 'add'
                                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-bold text-sm">Add Stock</span>
                                    </button>
                                    <button
                                        onClick={() => setAdjustForm({ ...adjustForm, type: 'remove' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${adjustForm.type === 'remove'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Minus className="w-5 h-5" />
                                        <span className="font-bold text-sm">Remove Stock</span>
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={adjustForm.quantity}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                    <select
                                        value={adjustForm.reason}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    >
                                        <option value="">Select Reason</option>
                                        <option value="po_received">Purchase Order Received</option>
                                        <option value="return">Customer Return</option>
                                        <option value="damage">Damaged / Expired</option>
                                        <option value="correction">Inventory Correction</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setShowAdjustModal(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button onClick={handleSaveAdjustment} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200">
                                    Confirm Adjustment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
