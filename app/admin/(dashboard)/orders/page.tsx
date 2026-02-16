'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreVertical, Truck, CheckCircle, AlertCircle, XCircle, Download, Upload, Trash2, Edit } from '@/lib/icons';
import * as XLSX from 'xlsx';

export default function AdminOrdersPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadOrders();
    }, [search, statusFilter]);

    const loadOrders = async () => {
        const saved = localStorage.getItem('admin_orders');
        if (saved) {
            let localOrders = JSON.parse(saved);
            if (search) {
                const lowerSearch = search.toLowerCase();
                localOrders = localOrders.filter((o: any) =>
                    o.id.toLowerCase().includes(lowerSearch) ||
                    (o.customer_name && o.customer_name.toLowerCase().includes(lowerSearch))
                );
            }
            if (statusFilter) {
                localOrders = localOrders.filter((o: any) => o.status === statusFilter);
            }
            setOrders(localOrders);
            setLoading(false);
        } else {
            fetchOrders();
        }
    };

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/v1/orders?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
            // Only save to LS if no filters are active, to preserve the full list?
            // Or just save what we got? If we save filtered list, we lose data.
            // Better to only save to LS if it's a full fetch.
            if (!search && !statusFilter) {
                localStorage.setItem('admin_orders', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Payment', 'Items'];
        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
                order.id,
                `"${order.customer_name || 'Guest'}"`,
                `"${new Date(order.created_at).toLocaleDateString()}"`,
                `"${order.total_amount}"`,
                order.status,
                order.payment_status,
                // Default items count if not joined
                order.items_count || 1
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Transform to match backend schema
                const transformedOrders = jsonData.map((row: any) => ({
                    id: row['Order ID'] || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    user_id: 1, // Default user for import
                    total_amount: row['Total'] || 0,
                    status: row['Status'] || 'created',
                    payment_status: row['Payment'] || 'pending'
                }));

                const res = await fetch('/api/v1/orders/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders: transformedOrders })
                });

                if (res.ok) {
                    alert('Orders imported successfully!');
                    fetchOrders();
                } else {
                    alert('Failed to import orders.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error processing file. Please ensure it is a valid Excel/CSV file.');
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = ''; // Reset
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        // Optimistic update for client-side persistence
        const updated = orders.filter(o => o.id !== id);
        setOrders(updated);

        // Update LocalStorage
        // We need to update the *full* list in LS, not just the filtered view.
        // But here we might only have the filtered view in `orders`.
        // Ideally we should load LS, filter it, save it.
        const saved = localStorage.getItem('admin_orders');
        if (saved) {
            const allOrders = JSON.parse(saved);
            const newAllOrders = allOrders.filter((o: any) => o.id !== id);
            localStorage.setItem('admin_orders', JSON.stringify(newAllOrders));
        }

        try {
            await fetch(`/api/v1/orders/${id}`, { method: 'DELETE' });
            // fetchOrders(); // Don't refetch, we handled it locally
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-gray-400 text-sm">Manage and track customer orders</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="">All Status</option>
                        <option value="created">Created</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Import Button */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv, .xlsx, .xls"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Import
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 btn-gradient text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-teal-500/20 flex items-center gap-2 transition-all"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Order ID, Customer Name..."
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-white placeholder:text-gray-500"
                />
            </div>

            {/* Orders Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders found.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-white">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-300 font-medium">{order.customer_name || 'Guest'}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                order.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    order.status === 'created' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.payment_status === 'refunded' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">₹{order.total_amount}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-teal-400 transition-colors" title="View">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

