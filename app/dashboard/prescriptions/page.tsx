'use client';

import React, { useState } from 'react';
import { Upload, FileText, Calendar, CheckCircle, XCircle, Clock, Eye, MoreVertical, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESCRIPTIONS = [
    {
        id: 'RX-2024-001',
        doctor: 'Dr. Sarah Smith',
        date: 'Nov 28, 2024',
        expiry: 'Dec 28, 2024',
        status: 'Approved',
        img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
        medicines: ['Amoxicillin 500mg', 'Paracetamol 650mg'],
        notes: 'Take with food. Complete the full course.'
    },
    {
        id: 'RX-2024-002',
        doctor: 'Unknown',
        date: 'Nov 30, 2024',
        expiry: 'N/A',
        status: 'Scanning...',
        img: 'https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=400&q=80',
        medicines: [],
        notes: 'Processing image...'
    },
    {
        id: 'RX-2024-003',
        doctor: 'Dr. R.K. Gupta',
        date: 'Oct 15, 2024',
        expiry: 'Nov 15, 2024',
        status: 'Rejected',
        reason: 'Image too blurry. Please re-upload.',
        img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
        medicines: [],
        notes: ''
    }
];

export default function PrescriptionsPage() {
    const [selectedRx, setSelectedRx] = useState<any>(null);

    return (
        <div className="animate-fade-in relative min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Prescriptions</h1>

            {/* Upload New Card */}
            <div className="mb-8">
                <div className="border-2 border-dashed border-teal-200 rounded-3xl bg-teal-50/50 p-8 text-center hover:bg-teal-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold text-teal-900 mb-2">Upload New Prescription</h3>
                    <p className="text-sm text-teal-600 mb-4">Drag & drop or click to browse</p>
                    <p className="text-xs text-teal-400">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>
            </div>

            {/* Prescription List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRESCRIPTIONS.map((rx) => (
                    <motion.div
                        key={rx.id}
                        layoutId={`rx-${rx.id}`}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                        {/* Thumbnail */}
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            <img src={rx.img} alt="Prescription" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${rx.status === 'Approved' ? 'bg-green-500/20 text-green-100 border border-green-500/30' :
                                        rx.status === 'Rejected' ? 'bg-red-500/20 text-red-100 border border-red-500/30' :
                                            'bg-blue-500/20 text-blue-100 border border-blue-500/30 animate-pulse'
                                    }`}>
                                    {rx.status}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{rx.doctor}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Uploaded: {rx.date}
                                    </p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {rx.status === 'Rejected' && (
                                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
                                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    {rx.reason}
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedRx(rx)}
                                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

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
                            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-20">
                                <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
                                <button onClick={() => setSelectedRx(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Image */}
                                    <div>
                                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-4">
                                            <img src={selectedRx.img} alt="Full Prescription" className="w-full h-auto" />
                                        </div>
                                        <button className="w-full py-2 text-teal-600 font-bold text-sm hover:underline">
                                            Download Image
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Doctor & Date</h3>
                                            <p className="text-lg font-bold text-gray-900">{selectedRx.doctor}</p>
                                            <p className="text-sm text-gray-500">Uploaded on {selectedRx.date}</p>
                                            {selectedRx.expiry !== 'N/A' && (
                                                <p className="text-sm text-red-500 mt-1">Expires on {selectedRx.expiry}</p>
                                            )}
                                        </div>

                                        {selectedRx.medicines.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Extracted Medicines</h3>
                                                <div className="space-y-2">
                                                    {selectedRx.medicines.map((med: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-sm font-medium text-gray-700">
                                                            <CheckCircle className="w-4 h-4 text-teal-500" /> {med}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedRx.notes && (
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pharmacist Notes</h3>
                                                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                                    {selectedRx.notes}
                                                </p>
                                            </div>
                                        )}

                                        {selectedRx.status === 'Approved' && (
                                            <button className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center justify-center gap-2">
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
