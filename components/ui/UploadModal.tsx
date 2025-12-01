'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        // Simulate upload
        setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
        }, 2000);
    };

    const reset = () => {
        setFile(null);
        setUploadStatus('idle');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-6 h-6 text-[#14b8a6]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Upload Prescription</h2>
                        <p className="text-sm text-gray-500">Upload your doctor's prescription to order medicines.</p>
                    </div>

                    {uploadStatus === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Successful!</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Our pharmacist will review it shortly.
                            </p>
                            <button
                                onClick={reset}
                                className="w-full bg-[#14b8a6] text-white font-bold py-3 rounded-xl hover:bg-[#0f766e] transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#14b8a6] hover:bg-teal-50/30 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none group-hover:scale-105 transition-transform">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-[#14b8a6]" />
                                    <p className="font-medium text-gray-900 mb-1">Click to upload</p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF</p>
                                </div>
                            </div>

                            {file && (
                                <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            <FileText className="w-4 h-4 text-[#14b8a6]" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all ${!file || isUploading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#14b8a6] hover:bg-[#0f766e] shadow-lg shadow-teal-500/20'
                                    }`}
                            >
                                {isUploading ? 'Uploading...' : 'Submit Prescription'}
                            </button>

                            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 text-left">
                                    Ensure patient & doctor names are visible.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
