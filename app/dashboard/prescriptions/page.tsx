'use client';

import React, { useState } from 'react';
import { Upload, FileText, Calendar, CheckCircle, XCircle, Eye, MoreVertical, ShoppingBag } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Prescriptions are loaded from the backend. Keep empty for a clean client-ready view.
const PRESCRIPTIONS: any[] = [];

export default function PrescriptionsPage() {
    const [selectedRx, setSelectedRx] = useState<any>(null);

    return (
        <div className="animate-fade-in relative min-h-screen">
            <h1 className="text-2xl font-bold text-white mb-8">My Prescriptions</h1>

            {/* Upload New Card */}
            <div className="mb-8">
                <div className="border-2 border-dashed border-teal-500/30 rounded-3xl bg-teal-500/5 p-8 text-center hover:bg-teal-500/10 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Upload New Prescription</h3>
                    <p className="text-sm text-gray-400 mb-4">Drag & drop or click to browse</p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>
            </div>

            {/* Prescription List */}
            {PRESCRIPTIONS.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No prescriptions yet</h2>
                    <p className="text-sm text-gray-400">Upload your first prescription to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PRESCRIPTIONS.map((rx) => (
                        <motion.div
                            key={rx.id}
                            layoutId={`rx-${rx.id}`}
                            className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all group"
                        >
                            {/* Thumbnail */}
                            <div className="h-40 bg-white/5 relative overflow-hidden">
                                <img src={rx.img} alt="Prescription" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${rx.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                            rx.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                                        }`}>
                                        {rx.status}
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{rx.doctor}</h3>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Uploaded: {rx.date}
                                        </p>
                                    </div>
                                    <button className="text-gray-500 hover:text-white">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                {rx.status === 'Rejected' && (
                                    <div className="bg-red-500/10 text-red-300 text-xs p-3 rounded-xl mb-4 flex items-start gap-2 border border-red-500/20">
                                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        {rx.reason}
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

                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Image */}
                                    <div>
                                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-sm mb-4">
                                            <img src={selectedRx.img} alt="Full Prescription" className="w-full h-auto" />
                                        </div>
                                        <button className="w-full py-2 text-teal-400 font-bold text-sm hover:underline">
                                            Download Image
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Doctor & Date</h3>
                                            <p className="text-lg font-bold text-white">{selectedRx.doctor}</p>
                                            <p className="text-sm text-gray-400">Uploaded on {selectedRx.date}</p>
                                            {selectedRx.expiry !== 'N/A' && (
                                                <p className="text-sm text-red-400 mt-1">Expires on {selectedRx.expiry}</p>
                                            )}
                                        </div>

                                        {selectedRx.medicines.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Extracted Medicines</h3>
                                                <div className="space-y-2">
                                                    {selectedRx.medicines.map((med: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 glass-panel p-2 rounded-lg text-sm font-medium text-gray-300 border border-white/10">
                                                            <CheckCircle className="w-4 h-4 text-teal-400" /> {med}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedRx.notes && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pharmacist Notes</h3>
                                                <p className="text-sm text-gray-300 glass-panel p-3 rounded-xl border border-white/10">
                                                    {selectedRx.notes}
                                                </p>
                                            </div>
                                        )}

                                        {selectedRx.status === 'Approved' && (
                                            <button className="w-full py-3 btn-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2">
                                                <ShoppingBag className="w-5 h-5" /> Order Medicines
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
