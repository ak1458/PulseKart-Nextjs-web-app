'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from '@/lib/icons';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-3xl p-0 overflow-hidden animate-scale-up relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <button
                    onClick={reset}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                            <Upload className="w-7 h-7 text-teal-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Upload Prescription</h2>
                        <p className="text-sm text-gray-400 font-light">Upload your doctor's prescription to order medicines.</p>
                    </div>

                    {uploadStatus === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Upload Successful!</h3>
                            <p className="text-sm text-gray-400 mb-8 font-light">
                                Our pharmacist will review it shortly.
                            </p>
                            <button
                                onClick={reset}
                                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:border-teal-400 hover:bg-teal-500/5 transition-all cursor-pointer relative group bg-white/5">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none group-hover:scale-105 transition-transform">
                                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4 group-hover:text-teal-400 transition-colors" />
                                    <p className="font-bold text-white mb-1">Click to upload</p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF</p>
                                </div>
                            </div>

                            {file && (
                                <div className="mt-5 bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/10">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-white/10 rounded border border-white/10">
                                            <FileText className="w-5 h-5 text-teal-300" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className={`w-full mt-8 py-3.5 rounded-xl font-bold text-white transition-all ${!file || isUploading
                                    ? 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] shadow-lg'
                                    }`}
                            >
                                {isUploading ? 'Uploading...' : 'Submit Prescription'}
                            </button>

                            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <p className="text-xs text-blue-200 text-left leading-relaxed">
                                    Ensure patient & doctor names are clearly visible. Your data is encrypted and secure.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

