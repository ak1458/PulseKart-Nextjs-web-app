'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, CheckCircle, Home, Briefcase, AlertCircle } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchAddresses,
    createAddress,
    deleteAddress,
    setDefaultAddress,
    type Address,
    type AddressLabel,
} from '@/lib/addresses-api';

const EMPTY_FORM = {
    label: 'home' as AddressLabel,
    recipientName: '',
    phone: '',
    line1: '',
    city: '',
    pincode: '',
};

/**
 * Validate before sending.
 *
 * These rules mirror the DTO in backend/src/addresses/dto/address.dto.ts. The
 * server revalidates everything - this exists to put the error next to the
 * field instead of after a round trip.
 */
function validate(form: typeof EMPTY_FORM): string[] {
    const errors: string[] = [];
    if (form.recipientName.trim().length < 2) errors.push('Enter the recipient’s name');
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) {
        errors.push('Enter a valid 10-digit mobile number');
    }
    if (form.line1.trim().length < 10) errors.push('Address must be at least 10 characters');
    if (form.city.trim().length < 2) errors.push('Enter a city');
    if (!/^\d{6}$/.test(form.pincode)) errors.push('Pincode must be 6 digits');
    return errors;
}

const LABEL_ICON: Record<AddressLabel, typeof Home> = {
    home: Home,
    work: Briefcase,
    other: MapPin,
};

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setAddresses(await fetchAddresses());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load your addresses.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function handleSave(event: React.FormEvent) {
        event.preventDefault();
        const errors = validate(form);
        setFormErrors(errors);
        if (errors.length > 0) return;

        setIsSaving(true);
        setError(null);
        try {
            await createAddress({ ...form, phone: form.phone.replace(/\D/g, '') });
            setForm(EMPTY_FORM);
            setIsAdding(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save this address.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: string) {
        setError(null);
        try {
            await deleteAddress(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete this address.');
        }
    }

    async function handleSetDefault(id: string) {
        setError(null);
        try {
            await setDefaultAddress(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update the default.');
        }
    }

    return (
        <div className="animate-fade-in relative min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">My Addresses</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 btn-gradient text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center text-gray-400">
                    Loading your addresses&hellip;
                </div>
            ) : addresses.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <MapPin className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No addresses saved</h2>
                    <p className="text-sm text-gray-400">
                        Add one here and it will be ready at checkout.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => {
                        const Icon = LABEL_ICON[address.label];
                        return (
                            <motion.div
                                key={address.id}
                                layout
                                className="glass-panel rounded-2xl border border-white/10 p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-teal-400" />
                                        <span className="text-sm font-bold capitalize text-white">
                                            {address.label}
                                        </span>
                                        {address.isDefault && (
                                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        aria-label={`Delete address for ${address.recipientName}`}
                                        className="text-gray-500 transition-colors hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="mt-3 font-medium text-white">{address.recipientName}</p>
                                <p className="text-sm text-gray-400">{address.phone}</p>
                                <p className="mt-1 text-sm text-gray-400">
                                    {address.line1}, {address.city} {address.pincode}
                                </p>

                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-teal-200"
                                    >
                                        <CheckCircle className="w-3 h-3" /> Set as default
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                        <motion.form
                            onSubmit={handleSave}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6"
                        >
                            <h2 className="mb-4 text-lg font-bold text-white">Add an address</h2>

                            {formErrors.length > 0 && (
                                <ul className="mb-4 space-y-1 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                                    {formErrors.map((message) => <li key={message}>{message}</li>)}
                                </ul>
                            )}

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    {(['home', 'work', 'other'] as AddressLabel[]).map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setForm({ ...form, label })}
                                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold capitalize transition-colors ${
                                                form.label === label
                                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                                    : 'border border-white/10 text-gray-400'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {([
                                    ['recipientName', 'Full name'],
                                    ['phone', '10-digit mobile number'],
                                    ['line1', 'Flat, building, street'],
                                    ['city', 'City'],
                                    ['pincode', '6-digit pincode'],
                                ] as const).map(([field, placeholder]) => (
                                    <input
                                        key={field}
                                        value={form[field]}
                                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-teal-500/50 focus:outline-none"
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); setFormErrors([]); }}
                                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-gradient flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving…' : 'Save address'}
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
