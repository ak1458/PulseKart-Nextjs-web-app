'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    X,
    Image as ImageIcon,
    Box,
    DollarSign,
    Search,
    ShieldCheck,
    Layers,
    Info,
    Plus,
    Trash2,
    Copy,
    Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'compliance';

export default function AddProductPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('basic');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        description: '',
        price: '',
        mrp: '',
        costPrice: '',
        taxRate: '18',
        stock: '',
        minStock: '',
        isPrescriptionRequired: false,
        isNarcotic: false,
        scheduleH: false,
        seoTitle: '',
        seoDescription: '',
        variants: [] as any[]
    });

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'inventory', label: 'Inventory', icon: Box },
        { id: 'images', label: 'Images', icon: ImageIcon },
        { id: 'seo', label: 'SEO', icon: Search },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    ];

    const calculateMargin = () => {
        const price = parseFloat(formData.price) || 0;
        const cost = parseFloat(formData.costPrice) || 0;
        if (price === 0) return { margin: 0, profit: 0 };
        const profit = price - cost;
        const margin = (profit / price) * 100;
        return { margin: margin.toFixed(2), profit: profit.toFixed(2) };
    };

    const { margin, profit } = calculateMargin();

    const handleAutofill = () => {
        const randomId = Math.floor(Math.random() * 1000);
        setFormData({
            ...formData,
            name: `Test Product ${randomId}`,
            sku: `TEST-${randomId}`,
            category: 'medicines',
            description: 'This is a generated test product description.',
            price: '150',
            mrp: '200',
            costPrice: '100',
            stock: '50',
            minStock: '10',
            seoTitle: `Test Product ${randomId}`,
            seoDescription: 'Test product for SEO purposes.'
        });
    };

    const handleDuplicate = () => {
        const randomId = Math.floor(Math.random() * 1000);
        setFormData({
            ...formData,
            name: `${formData.name} (Copy)`,
            sku: `${formData.sku}-COPY-${randomId}`,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/v1/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Product saved successfully!');
                router.push('/admin/products');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message || 'Failed to save product'}`);
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save product. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500 text-sm">Create a new item in your catalog</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAutofill} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <Wand2 className="w-4 h-4" /> Autofill
                    </button>
                    <button onClick={handleDuplicate} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <Link href="/admin/products" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Product
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white text-teal-600 shadow-md shadow-gray-100'
                                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'basic' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Product Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="e.g. Dolo 650mg"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">SKU</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="e.g. MED-001"
                                                value={formData.sku}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Category</label>
                                        <select
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="medicines">Medicines</option>
                                            <option value="wellness">Wellness</option>
                                            <option value="devices">Medical Devices</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Description</label>
                                        <textarea
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none h-32"
                                            placeholder="Detailed product description..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'pricing' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Selling Price (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">MRP (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="0.00"
                                                value={formData.mrp}
                                                onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Cost Price (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="0.00"
                                                value={formData.costPrice}
                                                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Tax Rate (%)</label>
                                            <select
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                value={formData.taxRate}
                                                onChange={e => setFormData({ ...formData, taxRate: e.target.value })}
                                            >
                                                <option value="0">0% (Exempt)</option>
                                                <option value="5">5%</option>
                                                <option value="12">12%</option>
                                                <option value="18">18%</option>
                                                <option value="28">28%</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Margin Calculation Display */}
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-xs text-green-600 font-bold uppercase tracking-wider">Estimated Profit</span>
                                            <span className="text-xl font-bold text-green-700">₹{profit}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-green-600 font-bold uppercase tracking-wider">Margin</span>
                                            <span className="text-xl font-bold text-green-700">{margin}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inventory' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Initial Stock</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="0"
                                                value={formData.stock}
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Low Stock Alert Level</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                                placeholder="10"
                                                value={formData.minStock}
                                                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                            <Box className="w-4 h-4" /> Variants
                                        </h4>
                                        <p className="text-sm text-blue-600 mb-4">Does this product have variants like size or color?</p>
                                        <button className="text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add Variant
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'compliance' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.isPrescriptionRequired}
                                                onChange={e => setFormData({ ...formData, isPrescriptionRequired: e.target.checked })}
                                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <div>
                                                <span className="font-bold text-gray-900 block">Prescription Required</span>
                                                <span className="text-sm text-gray-500">Customer must upload a valid prescription to buy this.</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.scheduleH}
                                                onChange={e => setFormData({ ...formData, scheduleH: e.target.checked })}
                                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <div>
                                                <span className="font-bold text-gray-900 block">Schedule H Drug</span>
                                                <span className="text-sm text-gray-500">Strictly sold on prescription of a Registered Medical Practitioner.</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.isNarcotic}
                                                onChange={e => setFormData({ ...formData, isNarcotic: e.target.checked })}
                                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <div>
                                                <span className="font-bold text-gray-900 block">Narcotic / Controlled Substance</span>
                                                <span className="text-sm text-gray-500">Requires special reporting and tracking.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Meta Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="SEO Title"
                                            value={formData.seoTitle}
                                            onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400">Recommended length: 50-60 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Meta Description</label>
                                        <textarea
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none h-24"
                                            placeholder="SEO Description"
                                            value={formData.seoDescription}
                                            onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400">Recommended length: 150-160 characters</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'images' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Click to upload images</h4>
                                        <p className="text-sm text-gray-500 mt-1">or drag and drop files here</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
