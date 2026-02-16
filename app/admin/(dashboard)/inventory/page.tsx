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
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';

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
        loadInventory();
    }, [filters]);

    const loadInventory = async () => {
        const saved = localStorage.getItem('admin_inventory');
        if (saved) {
            let localInventory = JSON.parse(saved);
            if (filters.search) {
                const lowerSearch = filters.search.toLowerCase();
                localInventory = localInventory.filter((i: any) =>
                    i.sku.toLowerCase().includes(lowerSearch) ||
                    i.product_name.toLowerCase().includes(lowerSearch)
                );
            }
            if (filters.warehouse && filters.warehouse !== 'All Warehouses') {
                localInventory = localInventory.filter((i: any) => i.warehouse_name === filters.warehouse);
            }
            setInventory(localInventory);
            setLoading(false);
        } else {
            fetchInventory();
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.warehouse && filters.warehouse !== 'All Warehouses') params.append('warehouse', filters.warehouse);

            const res = await fetch(apiUrl(`inventory?${params.toString()}`));
            const data = await res.json();
            const validData = Array.isArray(data) ? data : [];
            setInventory(validData);
            if (!filters.search && (!filters.warehouse || filters.warehouse === 'All Warehouses')) {
                localStorage.setItem('admin_inventory', JSON.stringify(validData));
            }
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
            const res = await fetch(apiUrl('inventory/adjust'), {
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

                // Update local state and storage manually to persist without refetching (which might reset if backend is mock)
                const updatedInventory = inventory.map(item => {
                    if (item.sku === selectedItem.sku && item.warehouse_code === selectedItem.warehouse_code && item.batch_no === selectedItem.batch_no) {
                        const change = adjustForm.type === 'add' ? adjustForm.quantity : -adjustForm.quantity;
                        return { ...item, qty_available: item.qty_available + change };
                    }
                    return item;
                });
                setInventory(updatedInventory);
                localStorage.setItem('admin_inventory', JSON.stringify(updatedInventory));

                // fetchInventory(); // Skip refetch to preserve local changes
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
            case 'In Stock': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'Low Stock': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
            case 'Out of Stock': return 'bg-red-500/10 text-red-400 border border-red-500/20';
            default: return 'bg-white/5 text-gray-400 border border-white/10';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Box className="w-6 h-6 text-teal-400" />
                        Inventory Management
                    </h1>
                    <p className="text-gray-400 text-sm">Real-time stock tracking across warehouses</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 glass-panel border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-colors">
                        <History className="w-4 h-4" />
                        Stock History
                    </button>
                    <Link href="/admin/warehouse/init" className="flex items-center gap-2 px-4 py-2 glass-panel border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                        Add Warehouse
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
                        <Plus className="w-4 h-4" />
                        Stock In (PO)
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Items</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{inventory.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
                            <Box className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Low Stock Items</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {inventory.filter(i => i.qty_available < 10 && i.qty_available > 0).length}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Out of Stock</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {inventory.filter(i => i.qty_available === 0).length}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by SKU, Name, or Batch..."
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-white placeholder-gray-500 transition-all"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
                        value={filters.warehouse}
                        onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                        style={{ colorScheme: 'dark' }} // Hacks native select for dark mode
                    >
                        <option>All Warehouses</option>
                    </select>
                    <button className="p-2 bg-black/20 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/10">
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
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading inventory...</td></tr>
                            ) : inventory.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No inventory found.</td></tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{item.product_name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                {item.warehouse_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <p className="font-medium text-gray-300">Batch: <span className="text-gray-400">{item.batch_no}</span></p>
                                                <p className="text-gray-500">Exp: {new Date(item.expiry_date).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-white text-lg">
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
                                                className="text-teal-400 hover:text-teal-300 font-bold text-xs hover:underline transition-colors"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none"></div>

                            <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                                <h3 className="text-lg font-bold text-white">Adjust Stock</h3>
                                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <Minus className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 relative z-10">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-sm font-bold text-white">{selectedItem.product_name}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{selectedItem.sku} • {selectedItem.warehouse_name}</p>
                                    <p className="text-sm font-medium text-gray-400 mt-2">Current Available: <span className="font-bold text-white">{selectedItem.qty_available}</span></p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${adjustForm.type === 'add'
                                            ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                                            : 'border-white/10 hover:bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-bold text-sm">Add Stock</span>
                                    </button>
                                    <button
                                        onClick={() => setAdjustForm({ ...adjustForm, type: 'remove' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${adjustForm.type === 'remove'
                                            ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                            : 'border-white/10 hover:bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        <Minus className="w-5 h-5" />
                                        <span className="font-bold text-sm">Remove Stock</span>
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={adjustForm.quantity}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-white focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Reason</label>
                                    <select
                                        value={adjustForm.reason}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-white focus:outline-none"
                                    >
                                        <option value="" className="text-gray-900">Select Reason</option>
                                        <option value="po_received" className="text-gray-900">Purchase Order Received</option>
                                        <option value="return" className="text-gray-900">Customer Return</option>
                                        <option value="damage" className="text-gray-900">Damaged / Expired</option>
                                        <option value="correction" className="text-gray-900">Inventory Correction</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 relative z-10">
                                <button onClick={() => setShowAdjustModal(false)} className="px-4 py-2 bg-transparent border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/5 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSaveAdjustment} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all">
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

