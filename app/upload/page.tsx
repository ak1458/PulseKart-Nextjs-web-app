'use client';

import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Prescription</h1>
                <p className="text-gray-500">Upload your doctor's prescription to order medicines.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {uploadStatus === 'success' ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
                        <p className="text-gray-600 mb-6">
                            Our pharmacist will review your prescription and prepare your cart within 2 hours.
                        </p>
                        <button
                            onClick={() => { setFile(null); setUploadStatus('idle'); }}
                            className="text-[#14b8a6] font-bold hover:underline"
                        >
                            Upload another
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#14b8a6] hover:bg-teal-50/30 transition-all cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-500">SVG, PNG, JPG or PDF (max. 5MB)</p>
                            </div>
                        </div>

                        {file && (
                            <div className="mt-6 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded border border-gray-200">
                                        <FileText className="w-5 h-5 text-[#14b8a6]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
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

                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 text-left">
                                <strong>Note:</strong> Please ensure the patient name, doctor's name, and date are clearly visible.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
