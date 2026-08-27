'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Calendar, CheckCircle, XCircle, Eye, MoreVertical, ShoppingBag, AlertCircle } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchPrescriptions,
    uploadPrescription,
    type PrescriptionSummary,
} from '@/lib/checkout-api';

/** Map the API's status onto the labels this page styles against. */
const STATUS_LABEL: Record<PrescriptionSummary['status'], string> = {
    pending_review: 'Under review',
    approved: 'Approved',
    rejected: 'Rejected',
};

export default function PrescriptionsPage() {
    const [selectedRx, setSelectedRx] = useState<PrescriptionSummary | null>(null);

    // Real prescriptions. This page previously read from a module-level
    // `const PRESCRIPTIONS: any[] = []` and its upload card had no file input
    // behind it at all - it was a styled div that did nothing when clicked.
    const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const load = useCallback(async () => {
        try {
            setPrescriptions(await fetchPrescriptions());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load your prescriptions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function handleUpload(file: File | undefined) {
        if (!file || isUploading) return;

        setIsUploading(true);
        setError(null);
        try {
            await uploadPrescription(file);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="animate-fade-in relative min-h-screen">
            <h1 className="text-2xl font-bold text-white mb-8">My Prescriptions</h1>

            {/* Upload New Card */}
            <div className="mb-8">
                <label className={`block border-2 border-dashed border-teal-500/30 rounded-3xl bg-teal-500/5 p-8 text-center transition-colors group ${isUploading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-teal-500/10'}`}>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                    />
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {isUploading ? 'Uploading…' : 'Upload New Prescription'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Click to browse</p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </label>

                {error && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-red-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Prescription List */}
            {isLoading ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center text-gray-400">
                    Loading your prescriptions&hellip;
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No prescriptions yet</h2>
                    <p className="text-sm text-gray-400">Upload your first prescription to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prescriptions.map((rx) => (
                        <motion.div
                            key={rx.id}
                            layoutId={`rx-${rx.id}`}
                            className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all group"
                        >
                            {/* Thumbnail */}
                            <div className="h-40 bg-white/5 relative overflow-hidden flex items-center justify-center">
                                {/* No thumbnail: the file is served as an attachment
                                    rather than inlined, so it is not rendered here. */}
                                <FileText className="w-10 h-10 text-gray-600" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${rx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                            rx.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        }`}>
                                        {STATUS_LABEL[rx.status]}
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white mb-1 truncate max-w-[12rem]">{rx.fileName}</h3>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Uploaded: {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <button className="text-gray-500 hover:text-white">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                {rx.status === 'rejected' && (
                                    <div className="bg-red-500/10 text-red-300 text-xs p-3 rounded-xl mb-4 flex items-start gap-2 border border-red-500/20">
                                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        This prescription was rejected during review.
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedRx(rx)}
                                    className="w-full py-2.5 rounded-xl border border-white/10 text-gray-300 font-bold text-sm hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" /> View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            <AnimatePresence>
                {selectedRx && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRx(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`rx-${selectedRx.id}`}
                            className="glass-dock rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-white/10"
                        >
                            <div className="sticky top-0 glass-dock border-b border-white/10 p-6 flex justify-between items-center z-20">
                                <h2 className="text-xl font-bold text-white">Prescription Details</h2>
                                <button onClick={() => setSelectedRx(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/*
                                Shows what is actually stored. The previous version
                                rendered a doctor's name, an expiry date, a list of
                                "Extracted Medicines" and pharmacist notes - none of
                                which exist. Nothing reads a prescription: there is no
                                OCR step, and review notes are not exposed to the
                                customer. Presenting invented clinical detail on a
                                pharmacy account is worse than presenting less.
                            */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">File</h3>
                                    <p className="text-lg font-bold text-white break-all">{selectedRx.fileName}</p>
                                    <p className="text-sm text-gray-400">
                                        {(selectedRx.sizeBytes / 1024).toFixed(0)} KB &middot; {selectedRx.mimeType}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                                    <p className="text-white">{STATUS_LABEL[selectedRx.status]}</p>
                                    <p className="text-sm text-gray-400">
                                        Uploaded on {new Date(selectedRx.createdAt).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                {selectedRx.status === 'pending_review' && (
                                    <p className="glass-panel rounded-xl border border-white/10 p-3 text-sm text-gray-300">
                                        A pharmacist will review this before any
                                        prescription-only medicine is dispensed against it.
                                    </p>
                                )}

                                <a
                                    href={`/api/v1/prescriptions/${selectedRx.id}/file`}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-bold text-teal-300 hover:bg-teal-500/10"
                                >
                                    <Eye className="w-4 h-4" /> Download original
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
