'use client';

import React, { useState } from 'react';
import {
    Zap,
    Plus,
    Trash2,
    Edit2,
    CheckCircle,
    XCircle,
    ArrowRight,
    MapPin,
    ShoppingCart,
    Tag,
    Truck,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rule {
    id: string;
    name: string;
    isActive: boolean;
    condition: {
        field: 'pincode' | 'cart_total' | 'items_count' | 'tag';
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
        value: string;
    };
    action: {
        type: 'assign_courier' | 'add_tag' | 'discount' | 'flag_review';
        value: string;
    };
}

const MOCK_RULES: Rule[] = [
    {
        id: '1',
        name: 'South Mumbai Express',
        isActive: true,
        condition: { field: 'pincode', operator: 'contains', value: '400001, 400005' },
        action: { type: 'assign_courier', value: 'Dunzo' }
    },
    {
        id: '2',
        name: 'High Value Order Review',
        isActive: true,
        condition: { field: 'cart_total', operator: 'greater_than', value: '5000' },
        action: { type: 'flag_review', value: 'High Value' }
    },
    {
        id: '3',
        name: 'Cold Chain Handling',
        isActive: true,
        condition: { field: 'tag', operator: 'contains', value: 'insulin' },
        action: { type: 'add_tag', value: 'Cold Storage' }
    }
];

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>(MOCK_RULES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRule, setNewRule] = useState<Partial<Rule>>({
        name: '',
        isActive: true,
        condition: { field: 'pincode', operator: 'equals', value: '' },
        action: { type: 'assign_courier', value: '' }
    });

    const handleDelete = (id: string) => {
        if (confirm('Delete this rule?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    const handleToggle = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleSaveRule = () => {
        if (!newRule.name || !newRule.condition?.value || !newRule.action?.value) return;

        const rule: Rule = {
            id: Date.now().toString(),
            name: newRule.name,
            isActive: true,
            condition: newRule.condition as Rule['condition'],
            action: newRule.action as Rule['action']
        };

        setRules([...rules, rule]);
        setIsModalOpen(false);
        setNewRule({
            name: '',
            isActive: true,
            condition: { field: 'pincode', operator: 'equals', value: '' },
            action: { type: 'assign_courier', value: '' }
        });
    };

    const getIconForField = (field: string) => {
        switch (field) {
            case 'pincode': return <MapPin className="w-4 h-4 text-blue-500" />;
            case 'cart_total': return <ShoppingCart className="w-4 h-4 text-green-500" />;
            case 'tag': return <Tag className="w-4 h-4 text-purple-500" />;
            default: return <Zap className="w-4 h-4 text-gray-500" />;
        }
    };

    const getIconForAction = (type: string) => {
        switch (type) {
            case 'assign_courier': return <Truck className="w-4 h-4 text-orange-500" />;
            case 'flag_review': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <CheckCircle className="w-4 h-4 text-teal-500" />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-teal-600" />
                        Automation Rules
                    </h1>
                    <p className="text-gray-500 text-sm">Create "If-Then" logic to automate your operations without coding.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                >
                    <Plus className="w-4 h-4" />
                    Create New Rule
                </button>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 gap-4">
                {rules.map((rule) => (
                    <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${rule.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60 bg-gray-50'
                            }`}
                    >
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-900 text-lg">{rule.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {rule.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
                                    <span className="text-xs uppercase text-blue-400 font-bold">IF</span>
                                    {getIconForField(rule.condition.field)}
                                    <span className="capitalize">{rule.condition.field.replace('_', ' ')}</span>
                                    <span className="text-blue-400">{rule.condition.operator.replace('_', ' ')}</span>
                                    <span className="font-bold">"{rule.condition.value}"</span>
                                </div>

                                <ArrowRight className="w-4 h-4 text-gray-300" />

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg font-medium border border-orange-100">
                                    <span className="text-xs uppercase text-orange-400 font-bold">THEN</span>
                                    {getIconForAction(rule.action.type)}
                                    <span className="capitalize">{rule.action.type.replace('_', ' ')}</span>
                                    <span className="font-bold">"{rule.action.value}"</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggle(rule.id)}
                                className={`p-2 rounded-lg transition-colors ${rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                                    }`}
                                title={rule.isActive ? "Deactivate" : "Activate"}
                            >
                                {rule.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(rule.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Create Automation Rule</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Rule Name</label>
                                    <input
                                        type="text"
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="e.g. Free Shipping for VIPs"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Condition (IF)</p>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                            value={newRule.condition?.field}
                                            onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition!, field: e.target.value as any } })}
                                        >
                                            <option value="pincode">Pincode</option>
                                            <option value="cart_total">Cart Total</option>
                                            <option value="items_count">Item Count</option>
                                            <option value="tag">Order Tag</option>
                                        </select>
                                        <select
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                            value={newRule.condition?.operator}
                                            onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition!, operator: e.target.value as any } })}
                                        >
                                            <option value="equals">Equals</option>
                                            <option value="contains">Contains</option>
                                            <option value="greater_than">Greater Than</option>
                                            <option value="less_than">Less Than</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={newRule.condition?.value}
                                        onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition!, value: e.target.value } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="Value (e.g. 400001 or 5000)"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action (THEN)</p>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                            value={newRule.action?.type}
                                            onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, type: e.target.value as any } })}
                                        >
                                            <option value="assign_courier">Assign Courier</option>
                                            <option value="add_tag">Add Tag</option>
                                            <option value="flag_review">Flag for Review</option>
                                            <option value="discount">Apply Discount</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={newRule.action?.value}
                                        onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, value: e.target.value } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="Value (e.g. Dunzo or VIP)"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button onClick={handleSaveRule} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200">
                                    Save Rule
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
