'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, MoreVertical, Package } from '@/lib/icons';

export default function AdminProductsPage() {
    const [products, setProducts] = React.useState<any[]>([]);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editForm, setEditForm] = React.useState({ price: '', stock: 0 });

    useEffect(() => {
        const saved = localStorage.getItem('admin_products');
        if (saved) {
            setProducts(JSON.parse(saved));
        }
    }, []);

    const handleEditClick = (product: any) => {
        setEditingId(product.id);
        setEditForm({
            price: product.price.replace('₹', '').replace(',', ''),
            stock: product.stock
        });
    };

    const handleSave = (id: string) => {
        const updated = products.map(p =>
            p.id === id ? { ...p, price: `₹${editForm.price}`, stock: editForm.stock } : p
        );
        setProducts(updated);
        localStorage.setItem('admin_products', JSON.stringify(updated));
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            localStorage.setItem('admin_products', JSON.stringify(updated));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
                    <p className="text-gray-400 text-sm">Manage your inventory and product details</p>
                </div>
                <Link href="/admin/products/new" className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-teal-500/20 flex items-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex gap-4">
                <div className="flex-1 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 focus-within:border-teal-500/50 transition-colors">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="bg-transparent outline-none text-sm w-full text-white placeholder:text-gray-500"
                    />
                </div>
                <select className="bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg px-4 py-2 outline-none focus:border-teal-500/50 [&>option]:bg-gray-900 [&>option]:text-white">
                    <option>All Categories</option>
                    <option>Medicine</option>
                    <option>Skincare</option>
                    <option>Devices</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 border border-white/5">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{product.category}</td>
                                <td className="px-6 py-4 font-bold text-white">
                                    {editingId === product.id ? (
                                        <input
                                            type="text"
                                            value={editForm.price}
                                            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-20 px-2 py-1 bg-black/50 border border-teal-500 rounded text-white outline-none"
                                        />
                                    ) : product.price}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-400">
                                    {editingId === product.id ? (
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                                            className="w-20 px-2 py-1 bg-black/50 border border-teal-500 rounded text-white outline-none"
                                        />
                                    ) : `${product.stock} units`}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${product.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        product.status === 'Low Stock' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === product.id ? (
                                            <button onClick={() => handleSave(product.id)} className="text-teal-400 font-bold text-xs hover:underline">Save</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(product)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

