'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Plus,
    Filter,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportJob {
    id: string;
    job_type: string;
    status: 'pending' | 'processing' | 'complete' | 'failed';
    created_at: string;
    output_url?: string;
    total_items: number;
}

export default function ExportHistoryPage() {
    const [jobs, setJobs] = useState<ExportJob[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // New Export Form State
    const [formData, setFormData] = useState({
        job_type: 'order_invoice',
        date_from: '',
        date_to: '',
        template: 'invoice_v2',
        format: 'pdf'
    });

    // Mock Fetch
    useEffect(() => {
        // Simulate initial data
        setJobs([
            { id: 'JOB-1701234567', job_type: 'order_invoice', status: 'complete', created_at: '2024-11-30T10:00:00Z', total_items: 50, output_url: '#' },
            { id: 'JOB-1701234568', job_type: 'payslip', status: 'processing', created_at: '2024-11-30T10:05:00Z', total_items: 0 }
        ]);
    }, []);

    const handleCreateExport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/v1/exports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export-${formData.job_type}-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Add to history
            const newJob: ExportJob = {
                id: `JOB-${Date.now()}`,
                job_type: formData.job_type,
                status: 'complete',
                created_at: new Date().toISOString(),
                total_items: 120, // Mock count for now
                output_url: '#'
            };
            setJobs([newJob, ...jobs]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to generate export');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'complete': return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Ready</span>;
            case 'processing': return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
            case 'failed': return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Failed</span>;
            default: return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700"><Clock className="w-3 h-3" /> Queued</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-teal-600" />
                        Export Center
                    </h1>
                    <p className="text-gray-500 text-sm">Generate and download reports, invoices, and payslips.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                >
                    <Plus className="w-4 h-4" />
                    New Export
                </button>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Job ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{job.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900 capitalize">{job.job_type.replace('_', ' ')}</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(job.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-600">{job.total_items || '-'}</td>
                                <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    {job.status === 'complete' && (
                                        <a href={job.output_url} className="inline-flex items-center gap-1 text-teal-600 font-bold hover:underline">
                                            <Download className="w-4 h-4" /> Download
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Export Modal */}
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
                                <h3 className="text-lg font-bold text-gray-900">Create New Export</h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Export Type</label>
                                    <select
                                        value={formData.job_type}
                                        onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    >
                                        <option value="order_invoice">Order Invoices (Bulk)</option>
                                        <option value="order_summary">Order Summary List</option>
                                        <option value="payslip">Employee Payslips</option>
                                        <option value="packing_slip">Packing Slips</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Date From</label>
                                        <input
                                            type="date"
                                            value={formData.date_from}
                                            onChange={e => setFormData({ ...formData, date_from: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Date To</label>
                                        <input
                                            type="date"
                                            value={formData.date_to}
                                            onChange={e => setFormData({ ...formData, date_to: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Template Style</label>
                                    <select
                                        value={formData.template}
                                        onChange={e => setFormData({ ...formData, template: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    >
                                        <option value="invoice_v2">Standard Invoice (v2)</option>
                                        <option value="invoice_compact">Compact Invoice</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Format</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="format"
                                                value="pdf"
                                                checked={formData.format === 'pdf'}
                                                onChange={() => setFormData({ ...formData, format: 'pdf' })}
                                                className="text-teal-600 focus:ring-teal-500"
                                            />
                                            <span className="text-gray-700">Single PDF (Merged)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="format"
                                                value="zip"
                                                checked={formData.format === 'zip'}
                                                onChange={() => setFormData({ ...formData, format: 'zip' })}
                                                className="text-teal-600 focus:ring-teal-500"
                                            />
                                            <span className="text-gray-700">ZIP Archive</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateExport}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Start Export
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
