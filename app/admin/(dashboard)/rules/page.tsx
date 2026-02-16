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
} from '@/lib/icons';
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

const MOCK_RULES: Rule[] = [];

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
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
                        className={`glass-panel p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${rule.isActive ? 'border-white/10' : 'border-white/5 opacity-60 bg-black/20'
                            }`}
                    >
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-white text-lg">{rule.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/5'
                                    }`}>
                                    {rule.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg font-medium border border-blue-500/20">
                                    <span className="text-xs uppercase text-blue-300 font-bold opacity-70">IF</span>
                                    {getIconForField(rule.condition.field)}
                                    <span className="capitalize text-white">{rule.condition.field.replace('_', ' ')}</span>
                                    <span className="text-blue-300">{rule.condition.operator.replace('_', ' ')}</span>
                                    <span className="font-bold text-white">"{rule.condition.value}"</span>
                                </div>

                                <ArrowRight className="w-4 h-4 text-gray-500" />

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg font-medium border border-orange-500/20">
                                    <span className="text-xs uppercase text-orange-300 font-bold opacity-70">THEN</span>
                                    {getIconForAction(rule.action.type)}
                                    <span className="capitalize text-white">{rule.action.type.replace('_', ' ')}</span>
                                    <span className="font-bold text-white">"{rule.action.value}"</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggle(rule.id)}
                                className={`p-2 rounded-lg transition-colors ${rule.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:bg-white/5'
                                    }`}
                                title={rule.isActive ? "Deactivate" : "Activate"}
                            >
                                {rule.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(rule.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden bg-[#0A0A0A]"
                        >
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">Create Automation Rule</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Rule Name</label>
                                    <input
                                        type="text"
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                        placeholder="e.g. Free Shipping for VIPs"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Condition (IF)</p>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white"
                                            value={newRule.condition?.field}
                                            onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition!, field: e.target.value as any } })}
                                        >
                                            <option value="pincode">Pincode</option>
                                            <option value="cart_total">Cart Total</option>
                                            <option value="items_count">Item Count</option>
                                            <option value="tag">Order Tag</option>
                                        </select>
                                        <select
                                            className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white"
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
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                        placeholder="Value (e.g. 400001 or 5000)"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action (THEN)</p>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white"
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
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder-gray-600"
                                        placeholder="Value (e.g. Dunzo or VIP)"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSaveRule} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
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

