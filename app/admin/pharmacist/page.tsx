'use client';

import React, { useState } from 'react';
import { FileText, Check, X, Eye, Clock } from 'lucide-react';

const MOCK_PRESCRIPTIONS = [
    {
        id: 'RX-1001',
        user: 'Rahul Kumar',
        date: '2024-11-30',
        status: 'Pending',
        image: 'https://placehold.co/600x800?text=Prescription+1',
        notes: 'Please check for interactions.'
    },
    {
        id: 'RX-1002',
        user: 'Priya Singh',
        date: '2024-11-29',
        status: 'Pending',
        image: 'https://placehold.co/600x800?text=Prescription+2',
        notes: ''
    },
    {
        id: 'RX-1003',
        user: 'Amit Patel',
        date: '2024-11-29',
        status: 'Approved',
        image: 'https://placehold.co/600x800?text=Prescription+3',
        notes: 'Approved for Dolo 650.'
    }
];

export default function PharmacistDashboard() {
    const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
    const [selectedRx, setSelectedRx] = useState<typeof MOCK_PRESCRIPTIONS[0] | null>(null);

    const handleAction = (id: string, action: 'Approve' | 'Reject') => {
        setPrescriptions(prev => prev.map(rx =>
            rx.id === id ? { ...rx, status: action === 'Approve' ? 'Approved' : 'Rejected' } : rx
        ));
        setSelectedRx(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Pending Reviews: {prescriptions.filter(p => p.status === 'Pending').length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-700">Prescription Queue</h3>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {prescriptions.map(rx => (
                                <div
                                    key={rx.id}
                                    onClick={() => setSelectedRx(rx)}
                                    className={`p-4 cursor-pointer hover:bg-teal-50 transition-colors ${selectedRx?.id === rx.id ? 'bg-teal-50 border-l-4 border-[#14b8a6]' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-900">{rx.id}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                rx.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {rx.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{rx.user}</p>
                                    <p className="text-xs text-gray-400 mt-1">{rx.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-2">
                        {selectedRx ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Reviewing {selectedRx.id}</h2>
                                        <p className="text-gray-500 text-sm">Patient: {selectedRx.user}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(selectedRx.id, 'Reject')}
                                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedRx.id, 'Approve')}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#14b8a6] text-white rounded-lg hover:bg-[#0f766e] font-bold shadow-lg shadow-teal-500/20"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center min-h-[400px]">
                                        <img
                                            src={selectedRx.image}
                                            alt="Prescription"
                                            className="max-w-full max-h-[500px] object-contain"
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2">Extracted Medicines (OCR)</h4>
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                <ul className="space-y-2 text-sm text-blue-800">
                                                    <li>• Dolo 650mg (10 tabs)</li>
                                                    <li>• Azithromycin 500mg (3 tabs)</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2">Pharmacist Notes</h4>
                                            <textarea
                                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                                                rows={4}
                                                placeholder="Add notes or instructions..."
                                                defaultValue={selectedRx.notes}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center h-full text-gray-400">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a prescription to review</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
