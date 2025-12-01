'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, MoreVertical, Package } from 'lucide-react';

const MOCK_PRODUCTS = [
    { id: 'PRD-001', name: 'Paracetamol 500mg', category: 'Medicine', price: '₹20.00', stock: 1240, status: 'Active' },
    { id: 'PRD-002', name: 'Vitamin C Serum', category: 'Skincare', price: '₹450.00', stock: 45, status: 'Low Stock' },
    { id: 'PRD-003', name: 'Digital Thermometer', category: 'Devices', price: '₹899.00', stock: 12, status: 'Active' },
    { id: 'PRD-004', name: 'N95 Mask (Pack of 5)', category: 'Essentials', price: '₹299.00', stock: 0, status: 'Out of Stock' },
    { id: 'PRD-005', name: 'Protein Powder 1kg', category: 'Nutrition', price: '₹2,499.00', stock: 85, status: 'Active' },
];

export default function AdminProductsPage() {
    const [products, setProducts] = React.useState(MOCK_PRODUCTS);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editForm, setEditForm] = React.useState({ price: '', stock: 0 });

    const handleEditClick = (product: any) => {
        setEditingId(product.id);
        setEditForm({
            price: product.price.replace('₹', '').replace(',', ''),
            stock: product.stock
        });
    };

    const handleSave = (id: string) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, price: `₹${editForm.price}`, stock: editForm.stock } : p
        ));
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
                    <p className="text-gray-500 text-sm">Manage your inventory and product details</p>
                </div>
                <Link href="/admin/products/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="bg-transparent outline-none text-sm w-full"
                    />
                </div>
                <select className="bg-gray-50 border-none text-sm font-medium rounded-lg px-4 py-2 outline-none">
                    <option>All Categories</option>
                    <option>Medicine</option>
                    <option>Skincare</option>
                    <option>Devices</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {editingId === product.id ? (
                                        <input
                                            type="text"
                                            value={editForm.price}
                                            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-20 px-2 py-1 border rounded"
                                        />
                                    ) : product.price}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">
                                    {editingId === product.id ? (
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                                            className="w-20 px-2 py-1 border rounded"
                                        />
                                    ) : `${product.stock} units`}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${product.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === product.id ? (
                                            <button onClick={() => handleSave(product.id)} className="text-teal-600 font-bold text-xs hover:underline">Save</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(product)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
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
